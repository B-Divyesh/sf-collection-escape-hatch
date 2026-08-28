use clap::{CommandFactory, Parser, Subcommand};
use collection_escape_hatch::{
    FailOn, Format, TargetFormat, compare, load_environment, load_source, load_target, render_json,
    render_markdown,
};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

/// Compare a Postman migration without sending requests.
#[derive(Parser, Debug)]
#[command(name = "escape-hatch", version, about, long_about = None, disable_help_subcommand = true)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Compare a Postman v2.1 collection with a Bruno or Hoppscotch export
    #[command(name = "compare", visible_alias = "verify")]
    Compare {
        /// Postman Collection v2.1 JSON export
        #[arg(short, long, value_name = "FILE")]
        source: PathBuf,
        /// Bruno directory/.bru/JSON or Hoppscotch JSON export
        #[arg(short, long, value_name = "PATH")]
        target: PathBuf,
        /// Target format (auto, bruno, hoppscotch)
        #[arg(long, default_value = "auto")]
        target_format: TargetFormat,
        /// Optional Postman environment JSON
        #[arg(long, value_name = "FILE")]
        source_environment: Option<PathBuf>,
        /// Optional target environment JSON or Bruno .bru
        #[arg(long, value_name = "FILE")]
        target_environment: Option<PathBuf>,
        /// Report format (markdown or json)
        #[arg(short, long, default_value = "markdown")]
        format: Format,
        /// Shorthand for --format json
        #[arg(long)]
        json: bool,
        /// Write report to this file instead of stdout
        #[arg(short, long, value_name = "FILE")]
        output: Option<PathBuf>,
        /// CI threshold (error, warning, never)
        #[arg(long, default_value = "error")]
        fail_on: FailOn,
    },
    /// Run a bundled, lossy comparison in an isolated temporary directory
    Demo,
}

fn main() {
    let cli = Cli::parse();
    let result = match cli.command {
        Some(Commands::Compare {
            source,
            target,
            target_format,
            source_environment,
            target_environment,
            format,
            json,
            output,
            fail_on,
        }) => run(RunOptions {
            source,
            target,
            target_format,
            source_environment,
            target_environment,
            format: if json { Format::Json } else { format },
            output,
            fail_on,
        }),
        Some(Commands::Demo) => run_demo(),
        None => {
            Cli::command().print_help().expect("help should render");
            println!();
            return;
        }
    };
    match result {
        Ok(failed) => {
            if failed {
                std::process::exit(1)
            }
        }
        Err(message) => {
            eprintln!("escape-hatch: {message}");
            std::process::exit(2);
        }
    }
}

fn run_demo() -> Result<bool, String> {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("cannot create demo identifier: {e}"))?
        .as_nanos();
    let directory = std::env::temp_dir().join(format!(
        "collection-escape-hatch-demo-{}-{stamp}",
        std::process::id()
    ));
    std::fs::create_dir_all(&directory)
        .map_err(|e| format!("cannot create demo directory {}: {e}", directory.display()))?;
    let source = directory.join("acme-orders.postman.json");
    let target = directory.join("acme-orders.hoppscotch.json");
    let report_path = directory.join("migration-report.md");
    write_demo_file(
        &source,
        include_str!("../examples/acme-orders.postman.json"),
    )?;
    write_demo_file(
        &target,
        include_str!("../examples/acme-orders-lossy.hoppscotch.json"),
    )?;

    let source_inventory = load_source(&source)?;
    let target_inventory = load_target(&target, TargetFormat::Hoppscotch)?;
    let report = compare(&source_inventory, &target_inventory);
    std::fs::write(&report_path, render_markdown(&report))
        .map_err(|e| format!("cannot write {}: {e}", report_path.display()))?;

    println!("Demo — bundled sample data");
    println!("Compared Acme Orders: Postman v2.1 → Hoppscotch");
    println!(
        "Found {} errors and {} warnings, including a changed method, auth, body, script, and missing request.",
        report.summary.errors, report.summary.warnings
    );
    println!("Report: {}", report_path.display());
    println!("Your working directory was not changed.");
    Ok(false)
}

fn write_demo_file(path: &Path, contents: &str) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| format!("cannot write {}: {e}", path.display()))
}

struct RunOptions {
    source: PathBuf,
    target: PathBuf,
    target_format: TargetFormat,
    source_environment: Option<PathBuf>,
    target_environment: Option<PathBuf>,
    format: Format,
    output: Option<PathBuf>,
    fail_on: FailOn,
}

fn run(options: RunOptions) -> Result<bool, String> {
    let mut source = load_source(&options.source)?;
    let mut target = load_target(&options.target, options.target_format)?;
    if options.source_environment.is_some() != options.target_environment.is_some() {
        return Err("provide both --source-environment and --target-environment so environment structure can be compared".into());
    }
    if let (Some(src), Some(dst)) = (options.source_environment, options.target_environment) {
        source
            .variables
            .extend(load_environment(&src, "environment")?);
        target
            .variables
            .extend(load_environment(&dst, "environment")?);
    }
    let report = compare(&source, &target);
    let failed = report.should_fail(options.fail_on);
    let rendered = match options.format {
        Format::Markdown => render_markdown(&report),
        Format::Json => render_json(&report)?,
    };
    if let Some(path) = options.output {
        std::fs::write(&path, rendered)
            .map_err(|e| format!("cannot write {}: {e}", path.display()))?;
        eprintln!(
            "escape-hatch: wrote {} ({} errors, {} warnings)",
            path.display(),
            report.summary.errors,
            report.summary.warnings
        );
    } else {
        print!("{rendered}");
    }
    Ok(failed)
}
