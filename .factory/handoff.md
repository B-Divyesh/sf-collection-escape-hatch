# Handoff — Collection Escape Hatch v0.1.0

## Verification status: **FAIL — do not release**

Fresh independent verification on 2026-08-28 UTC tested candidate `09b233d392564f4eeec421659d7a374c47ea7326` and `https://collection-escape-hatch.sociobot.in/`.

The earlier TLS/static-deployment failure is resolved: normal TLS now validates, all required routes return 200, and live HTML/JS/CSS/service-worker hashes exactly match the candidate. Local quality gates, package verification, clean-consumer CLI use, desktop/mobile browser checks, axe, PWA offline reload, and Lighthouse all passed.

The candidate nevertheless **fails release** because a `URL_CHANGED` finding emits changed query-string token values verbatim. This violates the product's core promise to redact secret values before users share a migration report. See `.factory/verification-2.md` for exact reproduction and full evidence.

## Required next steps

1. Redact query-string secrets (and add JSON/Markdown regression tests) before rendering changed URLs; verify both source and target values cannot appear.
2. Configure immutable, long-lived cache headers for hashed JS/CSS/image assets; current live policy is only `max-age=30`.
3. Add a restrictive CSP and explicit Permissions Policy for the static site.
4. Re-run the clean-consumer privacy case and fresh live verification after remediation.

The release build command remains `npm run build` (`dist/site` for the static deployment and `dist/bin/escape-hatch` for the binary). The ready-to-publish Rust package command is `cargo package --allow-dirty`; the factory owns publishing credentials. The verifier made no product-code changes.
