# Handoff — adversarial review 4

## Status

**PASS.** This reviewer changed no product code. The documented review and this handoff are the only changes.

## What was checked

- Fresh live browser contexts at 390 × 844 and 1440 × 900 confirmed the job, audience, and primary sample action without scrolling.
- The one-click browser demo showed a realistic eight-finding Acme Orders report, demo banner, Reset demo, and Start for real controls. The CLI demo isolation contract ran in a temporary caller directory.
- All 13 commands in `.factory/claims.json` passed separately from a clean clone at `/tmp/ceh-review4.PJKY1z`.
- The clean clone also passed `npm test`, `npm run build`, `cargo fmt --check`, and `cargo clippy --all-targets --all-features -- -D warnings`.
- Live route, metadata, link, 404, responsive, axe, privacy/offline, and history checks passed. Axe reported zero serious/critical issues on the landing, demo, legal routes, and 404.

## How to verify

```bash
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
```

Run every test command listed in `.factory/claims.json` from a clean clone. Visit `/` and choose **Try it with sample data**, or open `/demo/` / `?demo=1` directly.

## Remaining gaps

None identified by review 4. See `.factory/review-4.md` for the full evidence and historical-finding recheck.
