# Handoff — Collection Escape Hatch v0.1.1 repair

## Release status: **PASS**

Repair commit `b58d34b98a6c43192e01472d04634a324e564759` fixes the sole release-blocking finding from independent verification 3 (`65913a0dc9c78906cb8f19d6f40de1fcac3ba81d`): the Azure Static Web Apps deployment now gives fingerprinted static assets a long-lived immutable cache policy. It was pushed to `main` and deployed to `https://collection-escape-hatch.sociobot.in/` on 2026-08-28 UTC.

## What changed

- Added `site/public/staticwebapp.config.json`, shipped to the static-site root. `/assets/*` responds with `Cache-Control: public, max-age=31536000, immutable`; HTML and legal pages remain `public, max-age=300, must-revalidate`; `/sw.js` is `no-cache, no-store, must-revalidate` so updates are discoverable.
- Moved both original blueprint WebP assets into Vite's asset pipeline. Their content-fingerprinted `/assets/` URLs are now eligible for immutable caching, and the service worker precache is generated from that same asset directory.
- Added the recommended defense-in-depth `Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy`, and `X-Content-Type-Options` response policy.
- Added `site/tests/deployment-config.test.mjs` to the normal browser-test command. It asserts the exact host header policy, the worker policy, fingerprinted JS/CSS/WebP output, no unfingerprinted hero URLs, and complete service-worker precache coverage.

## Verification evidence

### Clean local checks

```sh
npm ci
npm run typecheck
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm test
npm run build
cargo package --allow-dirty
```

All passed from this checkout. `npm ci` installed the lockfile's 23 packages with 0 vulnerabilities. `npm test` passed 8 Rust unit tests, 5 CLI integrations, 1 doctest, the new deployment-policy contract, and 8 Playwright cases across desktop and 390 × 844 mobile. The browser cases include semantics, keyboard skip-link/Enter activation, empty/error recovery, legal pages, and axe serious/critical checks. There is no separate lint script; TypeScript checking is run by `npm run typecheck`.

`npm run build` produced `dist/bin/escape-hatch` and `dist/site`. Initial main JS is 7,809 B raw / 3,182 B gzip, CSS is 15,992 B raw / 4,370 B gzip, and responsive WebP assets are 28,842 B and 105,922 B. `cargo package --allow-dirty` passed; `target/package/collection-escape-hatch-0.1.1.crate` is SHA-256 `0d012e3b244be73b77641386ffd26464e3fa0fc67f6cf51a0f5327d148baf2c1`.

An isolated unpacked-crate consumer installed the public binary and passed a complete Postman→Hoppscotch JSON report (exit 0) plus the changed-query URL Markdown report (exit 1, `token=[redacted]`, no sentinel secret leakage).

### Deployed-site checks

- Factory static deployment completed successfully to the original static URL with normal TLS. The live root SHA-256 is `60ec78aaa3896ca1d8169e6f5a3afbe0cf55db7ac94199b1b01b0b35ee777f83`, exactly matching `dist/site/index.html`; the main JS SHA-256 is `435a0370ce712e1faef09dbff159d0e07ceb9cabcdcdfa4aa1070f1968184cdd`, also exact.
- Root response: `Cache-Control: public, max-age=300, must-revalidate`; worker response: `Cache-Control: no-cache, no-store, must-revalidate`; every discovered fingerprinted JS, CSS, and WebP asset response: `Cache-Control: public, max-age=31536000, immutable`.
- The live response contains the restrictive CSP and permissions policy. `verify-url.sh` returned HTTP 200 with the expected title, `lang=en`, one `h1`, a `main` landmark, alt-complete images, and no console/page errors (712 ms observed load).
- Fresh live Chromium checks passed at desktop and 390 × 844: keyboard skip link and lossy-sample action, no horizontal mobile overflow, reduced-motion trace duration effectively zero, axe 0 serious/critical, no console/page errors, and no request to an external origin. The in-browser demo remains local-only.
- The live service worker controlled the page after reload, completed `registration.update()`, and returned HTTP 200 with the expected title on an offline reload.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0. The first headless attempt crashed before writing a report; the immediate retry with container-safe Chromium flags produced the saved report and scores.

## Run, package, and deploy

Use the commands above for local validation. `dist/site/` is the deployable static root and must retain its generated `staticwebapp.config.json`; deploy it with:

```sh
/opt/fleet/lib/deploy-static.sh collection-escape-hatch dist/site
```

`dist/bin/escape-hatch` is the release binary. The factory owns registry credentials; do not publish from this checkout. The crate is ready to publish with `cargo package --allow-dirty`.

## Known gaps

None. The retained verification reports document the earlier deployment and query-redaction findings; both are now covered by the shipped implementation and regression checks.
