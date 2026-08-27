use serde::Serialize;
use std::collections::BTreeMap;
use std::str::FromStr;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Format {
    Markdown,
    Json,
}

impl FromStr for Format {
    type Err = String;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.to_ascii_lowercase().as_str() {
            "markdown" | "md" => Ok(Self::Markdown),
            "json" => Ok(Self::Json),
            _ => Err("expected markdown or json".into()),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TargetFormat {
    Auto,
    Bruno,
    Hoppscotch,
}

impl FromStr for TargetFormat {
    type Err = String;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.to_ascii_lowercase().as_str() {
            "auto" => Ok(Self::Auto),
            "bruno" => Ok(Self::Bruno),
            "hoppscotch" | "hopps" => Ok(Self::Hoppscotch),
            _ => Err("expected auto, bruno, or hoppscotch".into()),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FailOn {
    Error,
    Warning,
    Never,
}

impl FromStr for FailOn {
    type Err = String;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.to_ascii_lowercase().as_str() {
            "error" => Ok(Self::Error),
            "warning" | "warn" => Ok(Self::Warning),
            "never" => Ok(Self::Never),
            _ => Err("expected error, warning, or never".into()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Inventory {
    pub format: String,
    pub name: String,
    pub folders: BTreeMap<String, Folder>,
    pub requests: BTreeMap<String, Request>,
    pub variables: BTreeMap<String, Variable>,
    pub scripts: BTreeMap<String, Script>,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Script {
    pub path: String,
    pub event: String,
    pub lines: usize,
    #[serde(skip)]
    pub fingerprint: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Folder {
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Request {
    pub path: String,
    pub method: String,
    pub url: String,
    pub auth: String,
    pub body_kind: String,
    pub body_bytes: usize,
    pub scripts: BTreeMap<String, usize>,
    #[serde(skip)]
    pub script_fingerprints: BTreeMap<String, u64>,
    pub examples: BTreeMap<String, Example>,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Example {
    pub name: String,
    pub status_code: Option<u16>,
    pub body_bytes: usize,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Variable {
    pub name: String,
    pub scope: String,
    pub populated: bool,
    pub secret: bool,
    #[serde(skip)]
    pub fingerprint: u64,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize)]
pub struct Finding {
    pub code: String,
    pub severity: Severity,
    pub category: String,
    pub path: String,
    pub message: String,
    pub evidence: String,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Counts {
    pub folders: usize,
    pub requests: usize,
    pub variables: usize,
    pub scripts: usize,
    pub examples: usize,
    pub body_bytes: usize,
}

impl From<&Inventory> for Counts {
    fn from(i: &Inventory) -> Self {
        Self {
            folders: i.folders.len(),
            requests: i.requests.len(),
            variables: i.variables.len(),
            scripts: i.scripts.len() + i.requests.values().map(|r| r.scripts.len()).sum::<usize>(),
            examples: i.requests.values().map(|r| r.examples.len()).sum(),
            body_bytes: i.requests.values().map(|r| r.body_bytes).sum(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Summary {
    pub errors: usize,
    pub warnings: usize,
    pub info: usize,
    pub source: Counts,
    pub target: Counts,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub schema: String,
    pub verdict: String,
    pub source_format: String,
    pub target_format: String,
    pub summary: Summary,
    pub findings: Vec<Finding>,
}

impl Report {
    pub fn should_fail(&self, threshold: FailOn) -> bool {
        match threshold {
            FailOn::Error => self.summary.errors > 0,
            FailOn::Warning => self.summary.errors + self.summary.warnings > 0,
            FailOn::Never => false,
        }
    }
}
