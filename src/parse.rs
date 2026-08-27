use crate::model::{Example, Folder, Inventory, Request, Script, TargetFormat, Variable};
use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

pub fn load_source(path: &Path) -> Result<Inventory, String> {
    let value = read_json(path)?;
    let schema = value
        .pointer("/info/schema")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if !schema.contains("collection") || !schema.contains("v2.1") {
        return Err(format!(
            "{} is not a Postman Collection v2.1 export",
            path.display()
        ));
    }
    parse_postman(&value)
}

pub fn load_target(path: &Path, requested: TargetFormat) -> Result<Inventory, String> {
    if path.is_dir() {
        if requested == TargetFormat::Hoppscotch {
            return Err("a Hoppscotch target must be a JSON export, not a directory".into());
        }
        return parse_bruno_directory(path);
    }
    if path.extension().and_then(|x| x.to_str()) == Some("bru") {
        return parse_bruno_files(
            &[path.to_path_buf()],
            path.file_stem().and_then(|x| x.to_str()).unwrap_or("Bruno"),
        );
    }
    let value = read_json(path)?;
    let detected = if looks_like_hoppscotch(&value) {
        TargetFormat::Hoppscotch
    } else if looks_like_bruno(&value) {
        TargetFormat::Bruno
    } else {
        return Err(format!(
            "could not detect {} as Bruno or Hoppscotch; use --target-format to clarify",
            path.display()
        ));
    };
    let format = if requested == TargetFormat::Auto {
        detected
    } else {
        requested
    };
    match format {
        TargetFormat::Hoppscotch => parse_hoppscotch(&value),
        TargetFormat::Bruno => parse_bruno_json(&value),
        TargetFormat::Auto => unreachable!(),
    }
}

pub fn load_environment(path: &Path, scope: &str) -> Result<BTreeMap<String, Variable>, String> {
    if path.extension().and_then(|x| x.to_str()) == Some("bru") {
        let content =
            fs::read_to_string(path).map_err(|e| format!("cannot read {}: {e}", path.display()))?;
        return Ok(parse_bru_variables(&content, scope));
    }
    let value = read_json(path)?;
    let mut out = BTreeMap::new();
    let values = value
        .get("values")
        .or_else(|| value.get("variables"))
        .and_then(Value::as_array)
        .ok_or_else(|| {
            format!(
                "{} has no environment values/variables array",
                path.display()
            )
        })?;
    for entry in values {
        let Some(name) = entry
            .get("key")
            .or_else(|| entry.get("name"))
            .and_then(Value::as_str)
        else {
            continue;
        };
        let populated = entry.get("value").is_some_and(value_populated);
        let fingerprint = entry.get("value").map(fingerprint_value).unwrap_or(0);
        let secret = is_secret_name(name)
            || entry
                .get("type")
                .and_then(Value::as_str)
                .is_some_and(|v| v.eq_ignore_ascii_case("secret"));
        let key = format!("{scope}::{name}");
        out.insert(
            key,
            Variable {
                name: name.into(),
                scope: scope.into(),
                populated,
                secret,
                fingerprint,
            },
        );
    }
    Ok(out)
}

fn read_json(path: &Path) -> Result<Value, String> {
    let text =
        fs::read_to_string(path).map_err(|e| format!("cannot read {}: {e}", path.display()))?;
    serde_json::from_str(&text).map_err(|e| format!("{} is not valid JSON: {e}", path.display()))
}

fn parse_postman(value: &Value) -> Result<Inventory, String> {
    let mut inv = Inventory {
        format: "postman-v2.1".into(),
        name: value
            .pointer("/info/name")
            .and_then(Value::as_str)
            .unwrap_or("Postman collection")
            .into(),
        ..Default::default()
    };
    add_variables(&mut inv, value.get("variable"), "collection");
    add_postman_events(&mut inv, "$collection", value.get("event"));
    let auth = auth_type(value.get("auth")).unwrap_or_else(|| "none".into());
    let items = value
        .get("item")
        .and_then(Value::as_array)
        .ok_or("Postman collection has no item array")?;
    walk_postman(items, "", &auth, &mut inv);
    Ok(inv)
}

fn walk_postman(items: &[Value], parent: &str, inherited_auth: &str, inv: &mut Inventory) {
    for item in items {
        let name = safe_name(
            item.get("name")
                .and_then(Value::as_str)
                .unwrap_or("unnamed"),
        );
        let path = join_path(parent, &name);
        if let Some(children) = item.get("item").and_then(Value::as_array) {
            inv.folders
                .insert(path.clone(), Folder { path: path.clone() });
            add_variables(inv, item.get("variable"), &format!("folder:{path}"));
            add_postman_events(inv, &path, item.get("event"));
            let folder_auth = auth_type(item.get("auth")).unwrap_or_else(|| inherited_auth.into());
            walk_postman(children, &path, &folder_auth, inv);
            continue;
        }
        let Some(request) = item.get("request") else {
            continue;
        };
        let method = request
            .get("method")
            .and_then(Value::as_str)
            .unwrap_or("GET")
            .to_uppercase();
        let url = json_url(request.get("url"));
        let auth = auth_type(request.get("auth")).unwrap_or_else(|| inherited_auth.into());
        let (body_kind, body_bytes) = postman_body(request.get("body"));
        let script_details = postman_event_details(item.get("event"));
        let scripts = script_details
            .iter()
            .map(|(event, (lines, _))| (event.clone(), *lines))
            .collect();
        let script_fingerprints = script_details
            .into_iter()
            .map(|(event, (_, fingerprint))| (event, fingerprint))
            .collect();
        let mut examples = BTreeMap::new();
        if let Some(responses) = item.get("response").and_then(Value::as_array) {
            for (idx, response) in responses.iter().enumerate() {
                let ex_name = response
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or("example");
                let key = format!("{}#{idx}", safe_name(ex_name));
                examples.insert(
                    key,
                    Example {
                        name: ex_name.into(),
                        status_code: response
                            .get("code")
                            .and_then(Value::as_u64)
                            .map(|x| x as u16),
                        body_bytes: response
                            .get("body")
                            .and_then(Value::as_str)
                            .map(str::len)
                            .unwrap_or(0),
                    },
                );
            }
        }
        inv.requests.insert(
            path.clone(),
            Request {
                path,
                method,
                url,
                auth,
                body_kind,
                body_bytes,
                scripts,
                script_fingerprints,
                examples,
            },
        );
    }
}

fn add_postman_events(inv: &mut Inventory, path: &str, events: Option<&Value>) {
    for (event, (lines, fingerprint)) in postman_event_details(events) {
        let key = format!("{path}::{event}");
        inv.scripts.insert(
            key,
            Script {
                path: path.into(),
                event,
                lines,
                fingerprint,
            },
        );
    }
}

fn postman_event_details(events: Option<&Value>) -> BTreeMap<String, (usize, u64)> {
    let mut out = BTreeMap::new();
    for event in events.and_then(Value::as_array).into_iter().flatten() {
        let kind = event
            .get("listen")
            .and_then(Value::as_str)
            .unwrap_or("unknown")
            .replace("prerequest", "pre-request");
        let (lines, content) = match event.pointer("/script/exec") {
            Some(Value::Array(v)) => (
                v.len(),
                v.iter()
                    .filter_map(Value::as_str)
                    .collect::<Vec<_>>()
                    .join("\n"),
            ),
            Some(Value::String(v)) => (v.lines().count(), v.clone()),
            _ => (0, String::new()),
        };
        out.insert(kind, (lines, fingerprint(&content)));
    }
    out
}

fn postman_body(body: Option<&Value>) -> (String, usize) {
    let Some(body) = body else {
        return ("none".into(), 0);
    };
    let mode = body.get("mode").and_then(Value::as_str).unwrap_or("none");
    let size = match mode {
        "raw" => body
            .get("raw")
            .and_then(Value::as_str)
            .map(str::len)
            .unwrap_or(0),
        "graphql" => body
            .pointer("/graphql/query")
            .and_then(Value::as_str)
            .map(str::len)
            .unwrap_or(0),
        "urlencoded" | "formdata" => body
            .get(mode)
            .and_then(Value::as_array)
            .map(|v| serde_json::to_string(v).unwrap_or_default().len())
            .unwrap_or(0),
        "file" => body
            .pointer("/file/src")
            .and_then(Value::as_str)
            .map(str::len)
            .unwrap_or(0),
        _ => 0,
    };
    (mode.into(), size)
}

fn parse_hoppscotch(value: &Value) -> Result<Inventory, String> {
    let mut inv = Inventory {
        format: "hoppscotch".into(),
        name: value
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or("Hoppscotch collection")
            .into(),
        ..Default::default()
    };
    add_variables(&mut inv, value.get("variables"), "collection");
    walk_hopps(value, "", &mut inv);
    Ok(inv)
}

fn walk_hopps(node: &Value, parent: &str, inv: &mut Inventory) {
    if let Some(requests) = node.get("requests").and_then(Value::as_array) {
        for request in requests {
            let name = safe_name(
                request
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or("unnamed"),
            );
            let path = join_path(parent, &name);
            let method = request
                .get("method")
                .and_then(Value::as_str)
                .unwrap_or("GET")
                .to_uppercase();
            let url = request
                .get("endpoint")
                .or_else(|| request.get("url"))
                .and_then(Value::as_str)
                .unwrap_or_default()
                .into();
            let auth = request
                .pointer("/auth/authType")
                .or_else(|| request.pointer("/auth/type"))
                .and_then(Value::as_str)
                .unwrap_or("none")
                .to_ascii_lowercase();
            let body = request.get("body");
            let body_kind = body
                .and_then(|v| v.get("contentType").or_else(|| v.get("mode")))
                .and_then(Value::as_str)
                .unwrap_or("none")
                .to_ascii_lowercase();
            let body_bytes = body
                .and_then(|v| v.get("body").or_else(|| v.get("raw")))
                .and_then(Value::as_str)
                .map(str::len)
                .unwrap_or(0);
            let mut scripts = BTreeMap::new();
            let mut script_fingerprints = BTreeMap::new();
            for (key, event) in [("preRequestScript", "pre-request"), ("testScript", "test")] {
                if let Some(script) = request
                    .get(key)
                    .and_then(Value::as_str)
                    .filter(|s| !s.trim().is_empty())
                {
                    scripts.insert(event.into(), script.lines().count());
                    script_fingerprints.insert(event.into(), fingerprint(script));
                }
            }
            let mut examples = BTreeMap::new();
            if let Some(responses) = request
                .get("responses")
                .or_else(|| request.get("examples"))
                .and_then(Value::as_array)
            {
                for (idx, response) in responses.iter().enumerate() {
                    let ex_name = response
                        .get("name")
                        .and_then(Value::as_str)
                        .unwrap_or("example");
                    examples.insert(
                        format!("{}#{idx}", safe_name(ex_name)),
                        Example {
                            name: ex_name.into(),
                            status_code: response
                                .get("status")
                                .or_else(|| response.get("statusCode"))
                                .and_then(Value::as_u64)
                                .map(|x| x as u16),
                            body_bytes: response
                                .get("body")
                                .and_then(Value::as_str)
                                .map(str::len)
                                .unwrap_or(0),
                        },
                    );
                }
            }
            inv.requests.insert(
                path.clone(),
                Request {
                    path,
                    method,
                    url,
                    auth,
                    body_kind,
                    body_bytes,
                    scripts,
                    script_fingerprints,
                    examples,
                },
            );
        }
    }
    if let Some(folders) = node.get("folders").and_then(Value::as_array) {
        for folder in folders {
            let name = safe_name(
                folder
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or("unnamed"),
            );
            let path = join_path(parent, &name);
            inv.folders
                .insert(path.clone(), Folder { path: path.clone() });
            add_variables(inv, folder.get("variables"), &format!("folder:{path}"));
            walk_hopps(folder, &path, inv);
        }
    }
}

fn parse_bruno_json(value: &Value) -> Result<Inventory, String> {
    let mut inv = Inventory {
        format: "bruno-json".into(),
        name: value
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or("Bruno collection")
            .into(),
        ..Default::default()
    };
    add_variables(&mut inv, value.get("variables"), "collection");
    let items = value
        .get("items")
        .or_else(|| value.get("requests"))
        .and_then(Value::as_array)
        .ok_or("Bruno JSON has no items array")?;
    walk_bruno_json(items, "", &mut inv);
    Ok(inv)
}

fn walk_bruno_json(items: &[Value], parent: &str, inv: &mut Inventory) {
    for item in items {
        let name = safe_name(
            item.get("name")
                .and_then(Value::as_str)
                .unwrap_or("unnamed"),
        );
        let path = join_path(parent, &name);
        if let Some(children) = item.get("items").and_then(Value::as_array) {
            inv.folders
                .insert(path.clone(), Folder { path: path.clone() });
            walk_bruno_json(children, &path, inv);
            continue;
        }
        let req = item.get("request").unwrap_or(item);
        let method = req
            .get("method")
            .and_then(Value::as_str)
            .unwrap_or("GET")
            .to_uppercase();
        let url = req
            .get("url")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .into();
        let auth = req
            .pointer("/auth/mode")
            .or_else(|| req.pointer("/auth/type"))
            .and_then(Value::as_str)
            .unwrap_or("none")
            .into();
        let body = req.get("body");
        let body_kind = body
            .and_then(|b| b.get("mode").or_else(|| b.get("type")))
            .and_then(Value::as_str)
            .unwrap_or("none")
            .into();
        let body_bytes = body
            .and_then(|b| {
                b.get("json")
                    .or_else(|| b.get("text"))
                    .or_else(|| b.get("raw"))
            })
            .map(value_len)
            .unwrap_or(0);
        let mut scripts = BTreeMap::new();
        let mut script_fingerprints = BTreeMap::new();
        for (key, event) in [
            ("preRequest", "pre-request"),
            ("postResponse", "test"),
            ("tests", "test"),
        ] {
            if let Some(v) = item
                .pointer(&format!("/scripts/{key}"))
                .or_else(|| item.get(key))
            {
                let n = value_lines(v);
                if n > 0 {
                    scripts.insert(event.into(), n);
                    script_fingerprints.insert(event.into(), fingerprint(&value_text(v)));
                }
            }
        }
        inv.requests.insert(
            path.clone(),
            Request {
                path,
                method,
                url,
                auth,
                body_kind,
                body_bytes,
                scripts,
                script_fingerprints,
                examples: BTreeMap::new(),
            },
        );
    }
}

fn parse_bruno_directory(root: &Path) -> Result<Inventory, String> {
    let mut files = Vec::new();
    collect_bru_files(root, root, &mut files)?;
    if files.is_empty() {
        return Err(format!("{} contains no .bru request files", root.display()));
    }
    parse_bruno_files(
        &files,
        root.file_name()
            .and_then(|x| x.to_str())
            .unwrap_or("Bruno collection"),
    )
}

fn collect_bru_files(root: &Path, dir: &Path, out: &mut Vec<PathBuf>) -> Result<(), String> {
    let mut entries = fs::read_dir(dir)
        .map_err(|e| format!("cannot read {}: {e}", dir.display()))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    entries.sort_by_key(|e| e.file_name());
    for entry in entries {
        let path = entry.path();
        if path.is_dir() {
            if path
                .strip_prefix(root)
                .ok()
                .and_then(|p| p.components().next())
                .is_some_and(|c| c.as_os_str() == "environments")
            {
                continue;
            }
            collect_bru_files(root, &path, out)?;
        } else if path.extension().and_then(|x| x.to_str()) == Some("bru")
            && path.file_name().and_then(|x| x.to_str()) != Some("folder.bru")
        {
            out.push(path);
        }
    }
    Ok(())
}

fn parse_bruno_files(files: &[PathBuf], name: &str) -> Result<Inventory, String> {
    let root = common_root(files);
    let mut inv = Inventory {
        format: "bruno".into(),
        name: name.into(),
        ..Default::default()
    };
    for file in files {
        let content =
            fs::read_to_string(file).map_err(|e| format!("cannot read {}: {e}", file.display()))?;
        let relative = file.strip_prefix(&root).unwrap_or(file);
        let parent = relative
            .parent()
            .map(|p| p.to_string_lossy().replace('\\', "/"))
            .unwrap_or_default();
        if !parent.is_empty() {
            let mut built = String::new();
            for segment in parent.split('/') {
                built = join_path(&built, segment);
                inv.folders.entry(built.clone()).or_insert(Folder {
                    path: built.clone(),
                });
            }
        }
        let meta = bru_block(&content, "meta").unwrap_or_default();
        let item_name = line_value(&meta, "name").unwrap_or_else(|| {
            file.file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .into()
        });
        let path = join_path(&parent, &safe_name(&item_name));
        let mut method = "GET".to_string();
        let mut request_block = String::new();
        for candidate in ["get", "post", "put", "patch", "delete", "head", "options"] {
            if let Some(block) = bru_block(&content, candidate) {
                method = candidate.to_uppercase();
                request_block = block;
                break;
            }
        }
        let url = line_value(&request_block, "url").unwrap_or_default();
        let auth = line_value(&request_block, "auth").unwrap_or_else(|| "none".into());
        let body_kind = line_value(&request_block, "body").unwrap_or_else(|| "none".into());
        let body_bytes = if body_kind == "none" {
            0
        } else {
            bru_block(&content, &format!("body:{body_kind}"))
                .map(|s| s.trim().len())
                .unwrap_or(0)
        };
        let mut scripts = BTreeMap::new();
        let mut script_fingerprints = BTreeMap::new();
        for (header, event) in [
            ("script:pre-request", "pre-request"),
            ("script:post-response", "test"),
            ("tests", "test"),
        ] {
            if let Some(script) = bru_block(&content, header).filter(|s| !s.trim().is_empty()) {
                scripts.insert(event.into(), script.lines().count());
                script_fingerprints.insert(event.into(), fingerprint(&script));
            }
        }
        inv.requests.insert(
            path.clone(),
            Request {
                path,
                method,
                url,
                auth,
                body_kind,
                body_bytes,
                scripts,
                script_fingerprints,
                examples: BTreeMap::new(),
            },
        );
    }
    Ok(inv)
}

fn bru_block(content: &str, header: &str) -> Option<String> {
    let marker = format!("{header} {{");
    let start = content.find(&marker)? + marker.len();
    let bytes = content.as_bytes();
    let mut depth = 1i32;
    let mut in_string = false;
    let mut escaped = false;
    for i in start..bytes.len() {
        let c = bytes[i] as char;
        if in_string {
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == '"' {
                in_string = false;
            }
            continue;
        }
        if c == '"' {
            in_string = true;
        } else if c == '{' {
            depth += 1;
        } else if c == '}' {
            depth -= 1;
            if depth == 0 {
                return Some(content[start..i].trim().into());
            }
        }
    }
    None
}

fn parse_bru_variables(content: &str, scope: &str) -> BTreeMap<String, Variable> {
    let mut out = BTreeMap::new();
    for header in ["vars", "vars:secret"] {
        if let Some(block) = bru_block(content, header) {
            for line in block.lines() {
                let Some((name, value)) = line.split_once(':') else {
                    continue;
                };
                let name = name.trim();
                if name.is_empty() {
                    continue;
                }
                out.insert(
                    format!("{scope}::{name}"),
                    Variable {
                        name: name.into(),
                        scope: scope.into(),
                        populated: !value.trim().is_empty(),
                        secret: header.ends_with("secret") || is_secret_name(name),
                        fingerprint: fingerprint(value.trim()),
                    },
                );
            }
        }
    }
    out
}

fn add_variables(inv: &mut Inventory, values: Option<&Value>, scope: &str) {
    let Some(values) = values.and_then(Value::as_array) else {
        return;
    };
    for value in values {
        let Some(name) = value
            .get("key")
            .or_else(|| value.get("name"))
            .and_then(Value::as_str)
        else {
            continue;
        };
        inv.variables.insert(
            format!("{scope}::{name}"),
            Variable {
                name: name.into(),
                scope: scope.into(),
                populated: value.get("value").is_some_and(value_populated),
                secret: is_secret_name(name)
                    || value
                        .get("type")
                        .and_then(Value::as_str)
                        .is_some_and(|x| x.eq_ignore_ascii_case("secret")),
                fingerprint: value.get("value").map(fingerprint_value).unwrap_or(0),
            },
        );
    }
}

fn auth_type(auth: Option<&Value>) -> Option<String> {
    let auth = auth?;
    if auth.is_null() {
        return None;
    }
    auth.get("type")
        .or_else(|| auth.get("mode"))
        .and_then(Value::as_str)
        .map(normalize_auth)
}

pub fn normalize_auth(auth: &str) -> String {
    match auth.to_ascii_lowercase().as_str() {
        "bearer" | "bearer token" => "bearer".into(),
        "basic" | "basic auth" => "basic".into(),
        "apikey" | "api-key" | "api key" => "apikey".into(),
        "oauth2" | "oauth 2.0" => "oauth2".into(),
        "inherit" | "inherit from parent" => "inherit".into(),
        "noauth" | "none" => "none".into(),
        other => other.into(),
    }
}

fn json_url(url: Option<&Value>) -> String {
    match url {
        Some(Value::String(v)) => v.clone(),
        Some(Value::Object(map)) => map
            .get("raw")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .into(),
        _ => String::new(),
    }
}

fn looks_like_hoppscotch(v: &Value) -> bool {
    v.get("folders").is_some()
        || v.get("requests")
            .and_then(Value::as_array)
            .is_some_and(|r| r.iter().any(|x| x.get("endpoint").is_some()))
}
fn looks_like_bruno(v: &Value) -> bool {
    v.get("items").is_some()
        || v.get("type")
            .and_then(Value::as_str)
            .is_some_and(|x| x.contains("collection"))
}
fn line_value(block: &str, key: &str) -> Option<String> {
    block.lines().find_map(|line| {
        line.trim()
            .strip_prefix(&format!("{key}: "))
            .map(|v| v.trim().into())
    })
}
fn safe_name(name: &str) -> String {
    name.trim().replace('/', "∕")
}
fn join_path(parent: &str, name: &str) -> String {
    if parent.is_empty() {
        name.into()
    } else {
        format!("{parent}/{name}")
    }
}
fn value_populated(v: &Value) -> bool {
    match v {
        Value::Null => false,
        Value::String(s) => !s.is_empty(),
        _ => true,
    }
}
fn value_len(v: &Value) -> usize {
    v.as_str()
        .map(str::len)
        .unwrap_or_else(|| serde_json::to_string(v).unwrap_or_default().len())
}
fn value_lines(v: &Value) -> usize {
    match v {
        Value::String(s) => s.lines().count(),
        Value::Array(a) => a.len(),
        _ => 0,
    }
}
fn value_text(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Array(a) => a
            .iter()
            .filter_map(Value::as_str)
            .collect::<Vec<_>>()
            .join("\n"),
        _ => serde_json::to_string(v).unwrap_or_default(),
    }
}
fn fingerprint_value(value: &Value) -> u64 {
    fingerprint(&serde_json::to_string(value).unwrap_or_default())
}
fn fingerprint(value: &str) -> u64 {
    value
        .as_bytes()
        .iter()
        .fold(0xcbf29ce484222325u64, |hash, byte| {
            (hash ^ u64::from(*byte)).wrapping_mul(0x100000001b3)
        })
}
fn is_secret_name(name: &str) -> bool {
    let n = name.to_ascii_lowercase();
    [
        "secret",
        "token",
        "password",
        "passwd",
        "api_key",
        "apikey",
        "private",
        "credential",
    ]
    .iter()
    .any(|x| n.contains(x))
}
fn common_root(files: &[PathBuf]) -> PathBuf {
    if files.len() == 1 {
        return files[0].parent().unwrap_or(Path::new("")).to_path_buf();
    }
    let first = files[0].parent().unwrap_or(Path::new(""));
    first
        .ancestors()
        .find(|p| files.iter().all(|f| f.starts_with(p)))
        .unwrap_or(first)
        .to_path_buf()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn extracts_nested_bru_body() {
        let text = "post {\n url: x\n body: json\n}\nbody:json {\n {\"x\": {\"y\": 1}}\n}\n";
        assert!(bru_block(text, "body:json").unwrap().contains("\"y\""));
    }
    #[test]
    fn normalizes_common_auth() {
        assert_eq!(normalize_auth("Bearer Token"), "bearer");
    }
}
