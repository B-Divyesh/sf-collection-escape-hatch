# Collection Escape Hatch

Collection Escape Hatch is a local, read-only migration verifier for teams moving API work out of Postman. It inventories a Postman Collection v2.1 and compares the structures your team depends on—folders, requests, URLs, methods, bodies, auth, scripts, examples, and variables—against a Bruno or Hoppscotch export before anyone switches clients.

It never sends API requests, uploads files, or prints variable values.

## Install

Download a release binary for your platform, or build from source:

```sh
cargo install --path .
escape-hatch --help
```

Version 0.1.0 supports Postman Collection v2.1 sources and Bruno `.bru` directories, Bruno JSON collections, or Hoppscotch JSON exports as targets.

## Usage

Compare a collection and write a Markdown report:

```sh
escape-hatch verify \
  --source fixtures/postman-complete.json \
  --target fixtures/hoppscotch-lossy.json \
  --output migration-report.md
```

Include environments and produce deterministic JSON for CI:

```sh
escape-hatch verify \
  --source collection.json \
  --target bruno-collection/ \
  --source-environment postman-environment.json \
  --target-environment bruno-collection/environments/local.bru \
  --format json \
  --fail-on warning \
  --output migration-report.json
```

`--json` is shorthand for `--format json`. Omit `--output` to print the report to stdout. Input values are never included in either format; the report records variable names and whether a value is populated or marked secret.

Exit codes:

| Code | Meaning |
| ---: | --- |
| 0 | Verification completed and did not meet the chosen failure threshold |
| 1 | Verification completed and findings met `--fail-on` (`error` by default) |
| 2 | Usage, format detection, or file-reading error |

The verifier compares structure; it deliberately does not execute requests or claim behavioral equivalence. Review warnings where target formats model features differently.

## Development

Requirements: stable Rust and Node.js 20+.

```sh
npm install
npm test
npm run build
```

`npm test` runs Rust unit/integration tests and site tests. `npm run build` produces the release binary in `dist/bin/` and the deployable static site at `dist/site/`. The exact factory deploy directory is `dist/site`.

Useful individual commands:

```sh
cargo test
cargo run -- verify --source fixtures/postman-complete.json --target fixtures/hoppscotch-lossy.json
npm run dev
npm run build:site
cargo package --allow-dirty
```

## Report model

Every finding has a stable code, severity, category, artifact path, and evidence that contains no input values. JSON output includes schema version `escape-hatch.report/v1`, source/target formats, inventories, findings, and a verdict. Output order is stable so reports can be reviewed in pull requests.

## Privacy and security

All verification happens in-process on your machine. There is no telemetry, network client, cloud sync, or request execution in the CLI or the site demo. Treat generated reports as metadata: they contain request names, paths, methods, URLs, and variable names, but never variable values or headers.

## License and format notes

MIT licensed. See [LICENSE](LICENSE) and the maintained [format and license notes](docs/formats.md). Postman Collection v2.1 is consumed as an interoperable input format; Postman is a trademark of Postman, Inc. Hoppscotch exports and Bruno `.bru` files are read according to their public schemas/format documentation. This project is independent of those vendors.

Live documentation: https://collection-escape-hatch.sociobot.in
