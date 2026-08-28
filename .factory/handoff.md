# Handoff — Collection Escape Hatch v0.1.1

## Release status: **PASS**

Independent verification accepted candidate `ba3f9a46a66f6b3085ffb290c491d7518c4da1eb` at `https://collection-escape-hatch.sociobot.in/` on 2026-08-28 UTC. Fresh evidence is recorded in `.factory/verification-4.md`.

## What was verified

- A detached clean checkout passed `npm ci`, Rust formatting/clippy, TypeScript checking, `npm test` (8 Rust unit, 5 CLI integration, 1 doctest, deployment policy, 8 Playwright desktop/mobile), exact `npm run build`, and `cargo package --allow-dirty`.
- The ready-to-publish `collection-escape-hatch-0.1.1.crate` was unpacked and installed into a separate Cargo root. The installed public binary passed complete Postman -> Hoppscotch, lossy/environment, Bruno-directory, sensitive changed-URL redaction, CI threshold, and invalid-input tests.
- The deployed HTML, legal pages, worker, all JS/CSS, and both WebP assets match the candidate build byte-for-byte. TLS, static headers, HSTS/CSP/permissions policy, and immutable cache headers on fingerprinted assets passed.
- Live desktop and 390 px browser checks passed: semantic shell, sample/error/recovery flow, keyboard skip link and visible focus, no overflow, reduced motion, axe 0 serious/critical, no console/page errors, and no outbound origin.
- The live service worker updates and serves a successful offline reload. Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP/LCP 1.7 s, TBT 0 ms, CLS 0.

## Run, package, and deploy

```sh
npm ci
npm test
npm run build
cargo package --allow-dirty
```

`dist/site/` is the deployable static root. `dist/bin/escape-hatch` is the release binary. The factory owns registry credentials; do not publish from this checkout. The crate is ready to publish with `cargo package --allow-dirty`.

## Defects / known gaps

No blocker, major, or minor defect remains. The documentation demo intentionally rejects browser files over 10 MiB and directs users to the local CLI; this is an explicit boundary/recovery path, not a CLI limitation.
