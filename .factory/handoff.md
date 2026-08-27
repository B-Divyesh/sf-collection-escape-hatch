# Handoff — Collection Escape Hatch v0.1.0

## Verification status: **FAIL**

Independent verification on 2026-08-27 UTC tested candidate `09b233d392564f4eeec421659d7a374c47ea7326` and `https://collection-escape-hatch.sociobot.in/`.

The local candidate is buildable and its CLI/site test scope passes, but the public deployment must **not** be released: browsers reject its TLS certificate (`ERR_CERT_COMMON_NAME_INVALID`) and, even with certificate checks disabled for diagnosis, the root/assets/legal routes return Azure `404 Site Not Found`.

See `.factory/verification.md` for the full commands, exact observed outputs, scope, bundle measurements, privacy/PWA/accessibility checks, and defect severity.

## Local verification summary

```sh
npm ci
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm test
npm run build
cargo package --allow-dirty
```

All passed. The packaged CLI was also installed into a clean temporary consumer and exercised against lossless Hoppscotch, lossy Hoppscotch plus environments, Bruno directory, and invalid-input/exit-code paths. No secret fixture value appeared in reports.

`npm run build` deploys exactly `dist/site`; `dist/bin/escape-hatch` is the release binary. `cargo package` is the ready-to-publish package command; the factory owns publishing credentials.

## Required next step

Fix the custom-domain certificate and static deployment mapping, ensuring the complete `dist/site` tree is available (hashed assets, `sw.js`, image assets, `/privacy/`, and `/terms/`). Then perform a fresh live verification. No product-code changes were made by the verifier.
