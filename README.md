# Collection Escape Hatch

Compare Postman v2.1 with Bruno or Hoppscotch exports before your team switches clients. The report lists changed requests, folders, variables, auth, scripts, examples, and bodies.

The CLI runs locally. It does not send API requests, upload files, or print secret values.

## Try the bundled sample

After installing, run one command from any directory:

```sh
escape-hatch demo
```

The command copies sample exports into a new temporary directory. It prints the report path and leaves your current directory unchanged.

The browser demo is available at <https://collection-escape-hatch.sociobot.in/demo/>. It opens a realistic lossy migration in one click.

## Build from source

There are no release archives yet. Clone the repository before using the path-based Cargo install:

```sh
git clone https://github.com/B-Divyesh/sf-collection-escape-hatch.git
cd sf-collection-escape-hatch
cargo install --path .
escape-hatch --help
```

Version 0.1.2 accepts Postman Collection v2.1 sources. Targets may be Bruno directories, Bruno JSON files, or Hoppscotch JSON exports.

## Compare exports

Write a Markdown report:

```sh
escape-hatch compare \
  --source fixtures/postman-complete.json \
  --target fixtures/hoppscotch-lossy.json \
  --output migration-report.md
```

Include environment exports and write JSON for CI:

```sh
escape-hatch compare \
  --source collection.json \
  --target bruno-collection/ \
  --source-environment postman-environment.json \
  --target-environment bruno-collection/environments/local.bru \
  --format json \
  --fail-on warning \
  --output migration-report.json
```

`--json` means `--format json`. Omit `--output` to print the report.

`--fail-on` controls when CI receives exit code 1. Choose `error`, `warning`, or `never`.

| Exit code | Meaning |
| ---: | --- |
| 0 | The comparison finished below the chosen limit |
| 1 | Findings reached the chosen limit |
| 2 | The command, file, or format was invalid |

The CLI compares exported structure. It does not run requests or scripts, and it cannot prove matching client behavior.

## Report reference

Each finding includes a stable code, severity, category, artifact path, and redacted evidence. The same input produces the same report order.

JSON reports use schema identifier `escape-hatch.report/v1`. They include formats, inventory counts, findings, and a verdict.

## Privacy and redaction

The CLI and browser demo run on your device. They have no accounts, telemetry, analytics, cloud sync, or request execution.

Reports omit headers and variable values. They replace credentials before the host name with `[credentials-redacted]`.

Sensitive query matching ignores case. Hyphens and periods match underscores.

The exact sensitive names are `token`, `access_token`, `id_token`, `refresh_token`, `api_key`, `apikey`, `key`, and `secret`. They also include `client_secret`, `signature`, `sig`, `authorization`, `credential`, `password`, `session`, and `jwt`.

Reports retain parameter names and safe URL structure.

## Develop, test, and deploy

Requirements are stable Rust and Node.js 20 or newer.

```sh
npm ci
npm test
npm run build
```

`npm test` runs Rust tests and browser tests. It also runs every tagged claim test in `.factory/claims.json`.

`npm run build` creates `dist/bin/escape-hatch` and the static site under `dist/site/`.

Useful focused commands:

```sh
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm run typecheck
npm run test:claim -- --grep '@claim:offline-reload'
cargo package --allow-dirty
```

Deploy the contents of `dist/site/` to a static host. The factory deploys that directory to the live site.

## License and format notes

Collection Escape Hatch is free under the MIT License. See [LICENSE](LICENSE) and [format and license notes](docs/formats.md).

Postman, Bruno, and Hoppscotch name their respective products and projects. This independent interoperability tool is not endorsed by those vendors.
