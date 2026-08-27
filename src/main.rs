use clap::{CommandFactory, Parser, Subcommand};
use collection_escape_hatch::{
    FailOn, Format, TargetFormat, compare, load_environment, load_source, load_target, render_json,
    render_markdown,
};
use std::path::PathBuf;

/// Prove an API collection survived its move—without sending a request.
#[derive(Parser, Debug)]
#[command(name = "escape-hatch", version, about, long_about = None, disable_help_subcommand = true)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Compare a Postman v2.1 collection with a Bruno or Hoppscotch export
    #[command(alias = "compare")]
    Verify {
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
}

fn main() {
    let cli = Cli::parse();
    let Some(Commands::Verify {
        source,
        target,
        target_format,
        source_environment,
        target_environment,
        format,
        json,
        output,
        fail_on,
    }) = cli.command
    else {
        Cli::command().print_help().expect("help should render");
        println!();
        return;
    };
    match run(
        source,
        target,
        target_format,
        source_environment,
        target_environment,
        if json { Format::Json } else { format },
        output,
        fail_on,
    ) {
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

fn run(
    source_path: PathBuf,
    target_path: PathBuf,
    target_format: TargetFormat,
    source_environment: Option<PathBuf>,
    target_environment: Option<PathBuf>,
    format: Format,
    output: Option<PathBuf>,
    fail_on: FailOn,
) -> Result<bool, String> {
    let mut source = load_source(&source_path)?;
    let mut target = load_target(&target_path, target_format)?;
    if source_environment.is_some() != target_environment.is_some() {
        return Err("provide both --source-environment and --target-environment so environment structure can be compared".into());
    }
    if let (Some(src), Some(dst)) = (source_environment, target_environment) {
        source
            .variables
            .extend(load_environment(&src, "environment")?);
        target
            .variables
            .extend(load_environment(&dst, "environment")?);
    }
    let report = compare(&source, &target);
    let failed = report.should_fail(fail_on);
    let rendered = match format {
        Format::Markdown => render_markdown(&report),
        Format::Json => render_json(&report)?,
    };
    if let Some(path) = output {
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
