use std::process::Command;
use std::{fs, time::SystemTime};

fn cli() -> Command {
    Command::new(env!("CARGO_BIN_EXE_escape-hatch"))
}

#[test]
fn documented_complete_example_is_verified() {
    let output = cli()
        .args([
            "verify",
            "--source",
            "fixtures/postman-complete.json",
            "--target",
            "fixtures/hoppscotch-complete.json",
            "--json",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let report: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["verdict"], "verified");
    assert_eq!(report["summary"]["errors"], 0);
}

#[test]
fn lossy_migration_fails_and_redacts_secrets() {
    let output = cli()
        .args([
            "verify",
            "--source",
            "fixtures/postman-complete.json",
            "--target",
            "fixtures/hoppscotch-lossy.json",
            "--source-environment",
            "fixtures/postman-environment.json",
            "--target-environment",
            "fixtures/hoppscotch-environment.json",
            "--json",
        ])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(1));
    let report = String::from_utf8(output.stdout).unwrap();
    assert!(report.contains("REQUEST_MISSING"));
    assert!(report.contains("VARIABLE_MISSING"));
    assert!(report.contains("VARIABLE_VALUE_CHANGED"));
    assert!(!report.contains("do-not-print"));
    assert!(!report.contains("different-secret"));
    assert!(!report.contains("fixture-secret"));
}

#[test]
fn bruno_directory_is_detected() {
    let output = cli()
        .args([
            "verify",
            "--source",
            "fixtures/postman-complete.json",
            "--target",
            "fixtures/bruno",
            "--format",
            "json",
            "--fail-on",
            "never",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let report: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["target_format"], "bruno");
    assert_eq!(report["summary"]["target"]["requests"], 2);
}

#[test]
fn invalid_input_uses_exit_code_two() {
    let output = cli()
        .args([
            "verify",
            "--source",
            "fixtures/hoppscotch-complete.json",
            "--target",
            "fixtures/hoppscotch-lossy.json",
        ])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(2));
    assert!(String::from_utf8_lossy(&output.stderr).contains("not a Postman Collection v2.1"));
}

#[test]
fn changed_url_query_secrets_are_redacted_in_json_and_markdown() {
    for arguments in [vec!["--json"], vec!["--format", "markdown"]] {
        let output = cli()
            .args([
                "verify",
                "--source",
                "fixtures/postman-query-secret-source.json",
                "--target",
                "fixtures/hoppscotch-query-secret-target.json",
            ])
            .args(arguments)
            .output()
            .unwrap();
        assert_eq!(output.status.code(), Some(1));
        let report = String::from_utf8(output.stdout).unwrap();
        assert!(report.contains("URL_CHANGED"));
        assert!(report.contains("token=[redacted]"));
        assert!(report.contains("api_key=[redacted]"));
        assert!(report.contains("page=1"));
        for secret in [
            "source-query-sentinel",
            "source-key-sentinel",
            "target-query-sentinel",
            "target-key-sentinel",
        ] {
            assert!(!report.contains(secret), "report leaked {secret}");
        }
    }
}

#[test]
fn bundled_demo_uses_a_temp_directory_and_leaves_caller_untouched() {
    let caller = std::env::temp_dir().join(format!(
        "escape-hatch-caller-{:?}",
        SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    fs::create_dir_all(&caller).unwrap();
    fs::write(caller.join("keep.txt"), "untouched").unwrap();

    let output = cli().arg("demo").current_dir(&caller).output().unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8(output.stdout).unwrap();
    assert!(stdout.contains("Demo — bundled sample data"));
    assert!(stdout.contains("Your working directory was not changed."));
    let report = stdout
        .lines()
        .find_map(|line| line.strip_prefix("Report: "))
        .expect("demo prints its report path");
    let report_path = std::path::Path::new(report);
    assert!(report_path.starts_with(std::env::temp_dir()));
    assert!(!report_path.starts_with(&caller));
    let report_text = fs::read_to_string(report_path).unwrap();
    assert!(report_text.contains("METHOD_CHANGED"));
    assert!(report_text.contains("AUTH_CHANGED"));
    assert_eq!(
        fs::read_to_string(caller.join("keep.txt")).unwrap(),
        "untouched"
    );
    assert_eq!(fs::read_dir(&caller).unwrap().count(), 1);
}
