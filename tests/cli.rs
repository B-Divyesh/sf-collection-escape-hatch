use std::process::Command;

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
