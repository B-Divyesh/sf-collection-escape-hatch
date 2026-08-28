# Handoff — Collection Escape Hatch v0.1.1

## Repair status: local verification passed; static deployment queued from `main`

This repair resolves the release blocker in independent verification 2 (`d03fe25221ec2e3c12011eae2024f1f69b5ca6c5`): a `URL_CHANGED` finding could expose query-string token values in JSON and Markdown reports.

## What changed

- Sanitized URL evidence before it reaches either renderer. Inline authority credentials remain `[credentials-redacted]`; values for credential-bearing query names are `[redacted]` while query names, parameter order, fragments, and non-sensitive structure stay reviewable.
- The documented, case-insensitive policy treats hyphens and underscores alike and covers `token` (including common token variants), `api_key`/`apikey`, `key`, `secret`, `signature`/`sig`, `authorization`, `credential`, `password`, `session`, and `jwt`. Percent-encoded parameter names are recognized.
- Added source/target sentinel fixtures and a public-CLI regression that runs both `--json` and Markdown, asserts `URL_CHANGED`, asserts redacted query fields remain visible, and proves all four source/target sentinel values are absent.
- Bumped the CLI and site package to 0.1.1, documented the redaction boundary in README and `/privacy`, added the changelog entry, and added a strict TypeScript check to `npm test`.

## Exact local evidence (2026-08-28 UTC)

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed: 23 packages audited, 0 vulnerabilities. |
| Type/format/lint | `npm run typecheck`, `cargo fmt --check`, and `cargo clippy --all-targets --all-features -- -D warnings` passed. |
| Unit/integration | `npm test` passed: 8 Rust unit tests, 5 CLI integrations (including the new two-renderer redaction regression), 1 doctest, and 8 Playwright tests. |
| Browser/a11y | Playwright passed at desktop and 390 × 844 mobile; it covers the visible keyboard skip-link path, interactive demo, recovery states, semantic legal pages, zero console errors, and axe serious/critical findings. |
| Production build | `npm run build` passed and produced `dist/site/` plus `dist/bin/escape-hatch`. Initial JS is 7,809 B raw, CSS 15,992 B raw, mobile hero 28,842 B, and desktop hero 105,922 B. |
| PWA/privacy smoke | A 390 px Chromium run activated the production service worker, made an offline reload with the expected title, had `scrollWidth == 390`, and observed no third-party request origin. |
| Package/consumer | `cargo package --allow-dirty` passed: 48 files, 328.3 KiB unpacked / 188.8 KiB compressed. A fresh `cargo install --root` from `target/package/collection-escape-hatch-0.1.1` exposed `escape-hatch 0.1.1` and passed the sentinel JSON redaction check with `--fail-on never`. |

## Run and publish

```sh
npm ci
npm test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm run build
cargo package --allow-dirty
cargo install --path target/package/collection-escape-hatch-0.1.1 --root /tmp/escape-hatch-consumer
```

The factory owns registry credentials; do not publish from this checkout. `dist/site/` remains the static deployment artifact and `dist/bin/escape-hatch` remains the release binary.

## Deployment follow-up

The static deployment is initiated by pushing this repair to `main`. After the push, verify normal TLS and the `https://collection-escape-hatch.sociobot.in/` identity, `/privacy/`, `/terms/`, service worker, desktop/mobile browser flow, offline reload, response headers, and the deployed privacy policy text. The prior verifier’s two deployment-policy observations (30-second immutable-asset caching and no CSP/Permissions-Policy) are hosting configuration concerns; they were explicitly non-blocking and no deployment configuration exists in this repository to change them safely.
