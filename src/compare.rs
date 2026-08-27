use crate::model::{Counts, Finding, Inventory, Report, Severity, Summary};
use crate::parse::normalize_auth;
use std::collections::BTreeSet;

pub fn compare(source: &Inventory, target: &Inventory) -> Report {
    let mut findings = Vec::new();

    compare_keys(
        "FOLDER_MISSING",
        "folders",
        &source.folders.keys().cloned().collect(),
        &target.folders.keys().cloned().collect(),
        &mut findings,
    );
    compare_keys(
        "REQUEST_MISSING",
        "requests",
        &source.requests.keys().cloned().collect(),
        &target.requests.keys().cloned().collect(),
        &mut findings,
    );
    compare_variables(source, target, &mut findings);
    compare_scoped_scripts(source, target, &mut findings);

    for (path, src) in &source.requests {
        let Some(dst) = target.requests.get(path) else {
            continue;
        };
        if src.method != dst.method {
            add(
                &mut findings,
                "METHOD_CHANGED",
                Severity::Error,
                "requests",
                path,
                "HTTP method changed",
                format!("{} → {}", src.method, dst.method),
            );
        }
        if normalize_url(&src.url) != normalize_url(&dst.url) {
            add(
                &mut findings,
                "URL_CHANGED",
                Severity::Error,
                "requests",
                path,
                "Request URL changed",
                format!("{} → {}", safe_url(&src.url), safe_url(&dst.url)),
            );
        }
        let src_auth = normalize_auth(&src.auth);
        let dst_auth = normalize_auth(&dst.auth);
        if dst_auth == "inherit" && src_auth != "inherit" {
            add(
                &mut findings,
                "AUTH_INHERITED_UNVERIFIED",
                Severity::Warning,
                "auth",
                path,
                "Target inherits auth; effective credentials cannot be proven from this export",
                format!("source type: {src_auth}; target: inherit"),
            );
        } else if src_auth != dst_auth {
            add(
                &mut findings,
                "AUTH_CHANGED",
                Severity::Error,
                "auth",
                path,
                "Authentication type changed",
                format!("{src_auth} → {dst_auth}"),
            );
        }
        let src_body = canonical_body(&src.body_kind);
        let dst_body = canonical_body(&dst.body_kind);
        if src_body != dst_body {
            add(
                &mut findings,
                "BODY_MODE_CHANGED",
                Severity::Error,
                "bodies",
                path,
                "Request body mode changed",
                format!("{src_body} → {dst_body}"),
            );
        }
        if src.body_bytes != dst.body_bytes {
            let severity = if src.body_bytes > 0 && dst.body_bytes == 0 {
                Severity::Error
            } else {
                Severity::Warning
            };
            add(
                &mut findings,
                "BODY_SIZE_CHANGED",
                severity,
                "bodies",
                path,
                "Serialized body size changed",
                format!("{} bytes → {} bytes", src.body_bytes, dst.body_bytes),
            );
        }
        compare_request_scripts(path, src, dst, &mut findings);
        compare_examples(path, src, dst, &mut findings);
    }

    for path in target
        .requests
        .keys()
        .filter(|p| !source.requests.contains_key(*p))
    {
        add(
            &mut findings,
            "REQUEST_ADDED",
            Severity::Info,
            "requests",
            path,
            "Target contains an additional request",
            "not present in source".into(),
        );
    }
    for path in target
        .folders
        .keys()
        .filter(|p| !source.folders.contains_key(*p))
    {
        add(
            &mut findings,
            "FOLDER_ADDED",
            Severity::Info,
            "folders",
            path,
            "Target contains an additional folder",
            "not present in source".into(),
        );
    }

    findings.sort_by(|a, b| {
        (&a.severity, &a.category, &a.path, &a.code).cmp(&(
            &b.severity,
            &b.category,
            &b.path,
            &b.code,
        ))
    });
    let errors = findings
        .iter()
        .filter(|f| f.severity == Severity::Error)
        .count();
    let warnings = findings
        .iter()
        .filter(|f| f.severity == Severity::Warning)
        .count();
    let info = findings
        .iter()
        .filter(|f| f.severity == Severity::Info)
        .count();
    let verdict = if errors > 0 {
        "changes-detected"
    } else if warnings > 0 {
        "review-required"
    } else {
        "verified"
    };
    Report {
        schema: "escape-hatch.report/v1".into(),
        verdict: verdict.into(),
        source_format: source.format.clone(),
        target_format: target.format.clone(),
        summary: Summary {
            errors,
            warnings,
            info,
            source: Counts::from(source),
            target: Counts::from(target),
        },
        findings,
    }
}

fn compare_keys(
    code: &str,
    category: &str,
    source: &BTreeSet<String>,
    target: &BTreeSet<String>,
    findings: &mut Vec<Finding>,
) {
    for path in source.difference(target) {
        add(
            findings,
            code,
            Severity::Error,
            category,
            path,
            format!("Source {category} artifact is missing from target"),
            "present in source; absent from target".into(),
        );
    }
}

fn compare_variables(source: &Inventory, target: &Inventory, findings: &mut Vec<Finding>) {
    for (key, src) in &source.variables {
        let Some(dst) = target.variables.get(key) else {
            add(
                findings,
                "VARIABLE_MISSING",
                Severity::Error,
                "variables",
                key,
                "Variable name or scope is missing from target",
                format!("scope: {}; value: [redacted]", src.scope),
            );
            continue;
        };
        if src.populated != dst.populated {
            add(
                findings,
                "VARIABLE_POPULATION_CHANGED",
                Severity::Warning,
                "variables",
                key,
                "Variable populated/empty state changed",
                format!(
                    "source populated: {}; target populated: {}; values: [redacted]",
                    src.populated, dst.populated
                ),
            );
        }
        if src.secret && !dst.secret {
            add(
                findings,
                "VARIABLE_SECRET_DOWNGRADED",
                Severity::Warning,
                "variables",
                key,
                "Secret-marked variable is not marked secret in target",
                "values: [redacted]".into(),
            );
        }
        if src.populated && dst.populated && src.fingerprint != dst.fingerprint {
            add(
                findings,
                "VARIABLE_VALUE_CHANGED",
                Severity::Warning,
                "variables",
                key,
                "Variable value changed",
                "source value: [redacted]; target value: [redacted]".into(),
            );
        }
    }
    for (key, _) in target
        .variables
        .iter()
        .filter(|(k, _)| !source.variables.contains_key(*k))
    {
        add(
            findings,
            "VARIABLE_ADDED",
            Severity::Info,
            "variables",
            key,
            "Target contains an additional variable",
            "value: [redacted]".into(),
        );
    }
}

fn compare_scoped_scripts(source: &Inventory, target: &Inventory, findings: &mut Vec<Finding>) {
    for (key, src) in &source.scripts {
        match target.scripts.get(key) {
            None => add(
                findings,
                "SCRIPT_MISSING",
                Severity::Error,
                "scripts",
                &src.path,
                "Collection or folder script is missing from target",
                format!("event: {}; source lines: {}", src.event, src.lines),
            ),
            Some(dst) if src.lines != dst.lines => add(
                findings,
                "SCRIPT_SIZE_CHANGED",
                Severity::Warning,
                "scripts",
                &src.path,
                "Collection or folder script line count changed",
                format!("{}: {} → {} lines", src.event, src.lines, dst.lines),
            ),
            _ => {}
        }
        if let Some(dst) = target.scripts.get(key)
            && src.fingerprint != dst.fingerprint
        {
            add(
                findings,
                "SCRIPT_CONTENT_CHANGED",
                Severity::Error,
                "scripts",
                &src.path,
                "Collection or folder script content changed",
                format!("event: {}; content: [redacted]", src.event),
            );
        }
    }
}

fn compare_request_scripts(
    path: &str,
    source: &crate::model::Request,
    target: &crate::model::Request,
    findings: &mut Vec<Finding>,
) {
    for (event, src_lines) in &source.scripts {
        match target.scripts.get(event) {
            None => add(
                findings,
                "SCRIPT_MISSING",
                Severity::Error,
                "scripts",
                path,
                "Request script is missing from target",
                format!("event: {event}; source lines: {src_lines}"),
            ),
            Some(dst_lines) if src_lines != dst_lines => add(
                findings,
                "SCRIPT_SIZE_CHANGED",
                Severity::Warning,
                "scripts",
                path,
                "Request script line count changed",
                format!("{event}: {src_lines} → {dst_lines} lines"),
            ),
            _ => {}
        }
        if let (Some(src_fingerprint), Some(dst_fingerprint)) = (
            source.script_fingerprints.get(event),
            target.script_fingerprints.get(event),
        ) && src_fingerprint != dst_fingerprint
        {
            add(
                findings,
                "SCRIPT_CONTENT_CHANGED",
                Severity::Error,
                "scripts",
                path,
                "Request script content changed",
                format!("event: {event}; content: [redacted]"),
            );
        }
    }
}

fn compare_examples(
    path: &str,
    source: &crate::model::Request,
    target: &crate::model::Request,
    findings: &mut Vec<Finding>,
) {
    for (key, src) in &source.examples {
        let Some(dst) = target.examples.get(key) else {
            add(
                findings,
                "EXAMPLE_MISSING",
                Severity::Error,
                "examples",
                path,
                "Saved response example is missing from target",
                format!(
                    "example: {}; status: {}",
                    src.name,
                    src.status_code
                        .map(|x| x.to_string())
                        .unwrap_or_else(|| "unknown".into())
                ),
            );
            continue;
        };
        if src.status_code != dst.status_code {
            add(
                findings,
                "EXAMPLE_STATUS_CHANGED",
                Severity::Warning,
                "examples",
                path,
                "Example status code changed",
                format!(
                    "{}: {:?} → {:?}",
                    src.name, src.status_code, dst.status_code
                ),
            );
        }
        if src.body_bytes != dst.body_bytes {
            add(
                findings,
                "EXAMPLE_SIZE_CHANGED",
                Severity::Warning,
                "examples",
                path,
                "Example response body size changed",
                format!(
                    "{}: {} → {} bytes",
                    src.name, src.body_bytes, dst.body_bytes
                ),
            );
        }
    }
}

fn add(
    findings: &mut Vec<Finding>,
    code: &str,
    severity: Severity,
    category: &str,
    path: &str,
    message: impl Into<String>,
    evidence: String,
) {
    findings.push(Finding {
        code: code.into(),
        severity,
        category: category.into(),
        path: path.into(),
        message: message.into(),
        evidence,
    });
}

fn normalize_url(value: &str) -> String {
    value
        .trim()
        .trim_end_matches('/')
        .replace("%7B%7B", "{{")
        .replace("%7D%7D", "}}")
}
fn safe_url(value: &str) -> String {
    let trimmed = value.trim();
    if let Some((scheme, rest)) = trimmed.split_once("://") {
        let authority = rest.split('/').next().unwrap_or(rest);
        if authority.contains('@') {
            return format!(
                "{scheme}://[credentials-redacted]{}",
                rest.find('/').map(|i| &rest[i..]).unwrap_or("")
            );
        }
    }
    trimmed.into()
}
fn canonical_body(kind: &str) -> String {
    match kind.to_ascii_lowercase().as_str() {
        "application/json" | "json" | "raw" => "text/json".into(),
        "multipart/form-data" | "formdata" | "multipart" => "multipart".into(),
        "application/x-www-form-urlencoded" | "urlencoded" => "urlencoded".into(),
        "" | "none" | "null" => "none".into(),
        other => other.into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn reports_missing_request() {
        let mut a = Inventory::default();
        a.requests.insert(
            "A".into(),
            crate::model::Request {
                path: "A".into(),
                ..Default::default()
            },
        );
        let report = compare(&a, &Inventory::default());
        assert_eq!(report.summary.errors, 1);
        assert_eq!(report.findings[0].code, "REQUEST_MISSING");
    }
    #[test]
    fn credential_url_is_redacted() {
        assert_eq!(
            safe_url("https://a:b@example.com/x"),
            "https://[credentials-redacted]/x"
        );
    }

    #[test]
    fn detects_changed_script_with_same_line_count() {
        let mut source = Inventory::default();
        let mut target = Inventory::default();
        let mut a = crate::model::Request {
            path: "A".into(),
            ..Default::default()
        };
        a.scripts.insert("test".into(), 1);
        a.script_fingerprints.insert("test".into(), 10);
        let mut b = a.clone();
        b.script_fingerprints.insert("test".into(), 20);
        source.requests.insert("A".into(), a);
        target.requests.insert("A".into(), b);
        let report = compare(&source, &target);
        assert!(
            report
                .findings
                .iter()
                .any(|f| f.code == "SCRIPT_CONTENT_CHANGED")
        );
    }

    #[test]
    fn changed_variable_value_is_reported_without_value() {
        let mut source = Inventory::default();
        let mut target = Inventory::default();
        let variable = crate::model::Variable {
            name: "token".into(),
            scope: "environment".into(),
            populated: true,
            secret: true,
            fingerprint: 1,
        };
        let mut changed = variable.clone();
        changed.fingerprint = 2;
        source
            .variables
            .insert("environment::token".into(), variable);
        target
            .variables
            .insert("environment::token".into(), changed);
        let report = compare(&source, &target);
        let json = crate::render::render_json(&report).unwrap();
        assert!(json.contains("VARIABLE_VALUE_CHANGED"));
        assert!(json.contains("[redacted]"));
    }
}
