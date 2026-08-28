# Handoff — Collection Escape Hatch v0.1.1

## Release status: **FAIL — hosting cache policy prevents acceptance**

Independent verification 3 tested candidate `7be34c8dec49c1416723a894eb9a946a2c80e0c4` against `https://collection-escape-hatch.sociobot.in/` on 2026-08-28 UTC. The candidate and live deployment are functionally healthy and byte-identical, including the prior query-secret redaction repair. Release acceptance is **FAIL** because the deployed static host does not use long-lived immutable caching for hashed assets, as required by the performance contract.

## What was verified

- Fresh detached clean checkout: `npm ci`, TypeScript check, Rust formatting, strict Clippy, `npm test`, exact `npm run build`, and `cargo package --allow-dirty` all passed.
- `npm test` passed 8 Rust unit tests, 5 CLI integrations, 1 doctest, and 8 Playwright browser tests.
- The packed 0.1.1 crate was unpacked, installed into a new Cargo root, and its public binary passed complete Postman→Hoppscotch, lossy/environment, Bruno-directory, JSON/Markdown secret-redaction, report-output, and invalid-input/exit-code exercises.
- The live site passed normal TLS and candidate-byte hash comparison for HTML, assets, worker, legal pages, and images; desktop and 390 px browser behavior; keyboard skip link and visible focus; reduced motion; malformed-input recovery; axe (0 serious/critical); no console/page errors; no observed third-party requests; service-worker update and offline reload.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 100 ms, CLS 0.

## Required next step

Configure the deployment host to serve hash-named JS, CSS, and image assets with a long-lived `Cache-Control` value containing `immutable` (for example, one year). It currently sends `public, must-revalidate, max-age=30` for every tested asset, including `/assets/main-CNCl0H6D.js` and `/assets/styles-CmjHv4TW.css`. Keep HTML and the service-worker entry short-lived/revalidating if needed for update behavior. Then repeat the live header, candidate-hash, service-worker update, and offline checks.

Also recommended: add restrictive `Content-Security-Policy` and explicit `Permissions-Policy` headers; neither is currently present.

## Run and publish

```sh
npm ci
npm run typecheck
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm test
npm run build
cargo package --allow-dirty
```

`dist/site/` is the static deployment artifact; `dist/bin/escape-hatch` is the release binary. The factory owns registry credentials; do not publish from this checkout. See `.factory/verification-3.md` for exact evidence and all defects.
