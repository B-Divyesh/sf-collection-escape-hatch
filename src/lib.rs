//! Local structural verification for API client migrations.
//!
//! ```
//! use collection_escape_hatch::{compare, Inventory};
//!
//! let source = Inventory::default();
//! let target = Inventory::default();
//! let report = compare(&source, &target);
//! assert_eq!(report.verdict, "verified");
//! ```

pub mod compare;
pub mod model;
pub mod parse;
pub mod render;

pub use compare::compare;
pub use model::{FailOn, Format, Inventory, Report, TargetFormat};
pub use parse::{load_environment, load_source, load_target};
pub use render::{render_json, render_markdown};
