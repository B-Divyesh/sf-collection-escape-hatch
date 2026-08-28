# Handoff — Collection Escape Hatch v0.1.1

## Repair status: **PASS — deployed to production**

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

## Production deployment evidence (2026-08-28 UTC)

- Pushed repair commit `fed9972` to `main`, then deployed `dist/site/` with the factory static deployment helper. Azure deployment `8a9df6fa-ae37-43a0-a8b9-57c6ed730232` succeeded; the custom domain was `Ready` and normal HTTPS returned 200.
- `verify-url.sh` passed against `https://collection-escape-hatch.sociobot.in`: title, `lang=en`, one `h1`, a main landmark, zero images missing alt text, zero unlabeled buttons, and no browser console/page errors (866 ms load in its desktop smoke).
- Normal TLS served `/`, `/privacy/`, `/terms/`, and `/sw.js` with 200. The live `/privacy/` SHA-256 matches `dist/site/privacy/index.html` and contains the updated credential-bearing query redaction policy. Live headers include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`.
- A second live Chromium run at 390 × 844 verified the visible skip-link keyboard path, loaded the lossy sample to `METHOD_CHANGED`, found zero axe serious/critical violations, had no console errors or third-party request origin, activated the service worker, and reloaded offline with the expected title and no horizontal overflow.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 70 ms, CLS 0.

## Known non-blocking hosting gaps

The static host still serves hashed assets with `Cache-Control: public, must-revalidate, max-age=30` and does not emit CSP, Permissions-Policy, or cross-origin isolation headers. These were documented by the independent verifier as non-blocking deployment-policy issues. This repository has no checked-in static-host configuration, so changing those controls would require a separately scoped hosting-policy change rather than altering the repaired CLI behavior.
