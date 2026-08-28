# Independent verification 4 — PASS

**Work order:** `collection-escape-hatch-verify-4`  
**Candidate:** `ba3f9a46a66f6b3085ffb290c491d7518c4da1eb`  
**Public URL:** `https://collection-escape-hatch.sociobot.in/`  
**Verification date:** 2026-08-28 UTC  
**Verdict:** **PASS — accept this candidate.** The previous deployment/cache-policy failure is repaired. Fresh clean-checkout, packed-consumer, live-byte, browser, privacy, PWA, accessibility, and performance evidence all meet the researched brief and factory contract.

No product code or deployment configuration was modified during this verification. This report and the handoff update are the only verifier changes.

## Clean candidate checks

A detached worktree at the exact SHA was used. `npm ci` installed the lockfile's 23 packages with 0 vulnerabilities.

| Check | Fresh evidence |
| --- | --- |
| Static quality | `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`, and `npm run typecheck` passed. There is no separate lint script/configuration. |
| Test suite | `npm test` passed: 8 Rust unit tests, 5 CLI integrations, 1 doctest, the deployment-policy contract, and 8 Playwright tests across desktop and 390 x 844 mobile. |
| Exact production build | `npm run build` passed and produced `dist/bin/escape-hatch` plus the deployable `dist/site/` PWA. |
| Publish artifact | `cargo package --allow-dirty` passed. `collection-escape-hatch-0.1.1.crate` is 198,038 bytes; SHA-256 `921aee56b16ac24d901788806a01471c3519e594e627aa103c7e2804c98f1bc0`. |
| Budgets | Main JS: 7,809 B raw / about 3.17 KB gzip; CSS: 15,992 B raw / about 4.35 KB gzip; mobile/desktop WebP: 28,842 B / 105,922 B. All are within the 200 KB JS, 50 KB CSS, and 300 KB mobile-hero budgets. |

## CLI end-to-end and consumer evidence

I unpacked the crate into a separate temporary consumer, installed it into a new Cargo root, and invoked only that installed binary (`escape-hatch 0.1.1`). Its help exposes the single documented `verify` command.

- Complete Postman v2.1 -> Hoppscotch fixture: exit 0, JSON `verdict: "verified"`, zero findings.
- Lossy Hoppscotch plus paired environment exports: exit 1, 10 findings including `AUTH_CHANGED`, `BODY_MODE_CHANGED`, `BODY_SIZE_CHANGED`, `EXAMPLE_MISSING`, `REQUEST_MISSING`, `METHOD_CHANGED`, `SCRIPT_MISSING`, `VARIABLE_MISSING`, and variable-population/value changes.
- Bruno directory auto-detection: exit 0 with `--fail-on never`, target format `bruno`, preserving four migration findings.
- Changed URLs carrying `token` and `api_key` sentinel values: exit 1; Markdown retained parameter names and `page=1`, rendered both sensitive values as `[redacted]`, and contained none of `source-token`, `target-token`, `api-source`, or `api-target`.
- Invalid non-Postman source and invalid `--fail-on nope`: each used documented exit 2 with actionable stderr. The browser demo separately rejects malformed JSON and its 10 MiB + 1 byte preview boundary, then successfully recovers through **Load lossy sample**.

The normal/lossy fixture set covers folders, requests, methods, URLs, collection/environment variables, auth, scripts, examples, body mode/size, report formats, CI exits, and redaction. `cargo tree` contains only `clap`, `serde`, and `serde_json` (and their transitive dependencies): no HTTP client or telemetry dependency.

## Live deployment, privacy, and browser evidence

All requests used ordinary TLS validation on 2026-08-28 UTC. The certificate CN/SAN is `collection-escape-hatch.sociobot.in`, issued by DigiCert and valid through 2027-02-27.

- Live bytes exactly match the clean build for `/`, `/privacy/`, `/terms/`, `/sw.js`, all four JS/CSS assets, and both WebP files. Example SHA-256s: root `60ec78aaa3896ca1d8169e6f5a3afbe0cf55db7ac94199b1b01b0b35ee777f83`, main JS `435a0370ce712e1faef09dbff159d0e07ceb9cabcdcdfa4aa1070f1968184cdd`, CSS `46ead1b8e6f50ec8ea78ae15d8fe045e4f5049bfda6ea20e5a778fa60961477e`, and worker `320262debf639c70c5a5de5280233044d06438a9c94a513685e68b8551d19596`.
- `/`, legal pages, and `/sw.js` return HTTP 200. HTML/legal routes use short revalidating cache; the service-worker entry is `no-cache, no-store, must-revalidate`; every fingerprinted JS/CSS/WebP asset returns `public, max-age=31536000, immutable`.
- Responses carry HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, a same-origin restrictive CSP, and an explicit restrictive `Permissions-Policy`.
- Desktop Chromium found the expected title, `lang=en`, exactly one `h1`, and one `main`; empty, malformed JSON, >10 MiB, lossy sample, and Clear/recovery states all behaved as described. The sample visibly reported method/auth/body/script loss.
- At 390 x 844, `scrollWidth == innerWidth == 390`; the lossy-sample flow works and the report stacks without horizontal overflow. Visual inspection confirmed readable, intentional desktop and mobile layouts.
- Keyboard Tab reaches **Skip to content** first. It has a visible coral `3px` solid outline with `3px` offset; Enter activates the primary sample action. Fresh axe scan: **0 serious/critical findings**. No console errors or page errors occurred.
- With `prefers-reduced-motion: reduce`, report animation duration was `0.00001s` with one iteration. Touch-target audit also passed in Lighthouse.
- Browser request capture observed no external origin. Static review found no analytics, storage, upload, API execution, or CDN asset path; the only `fetch` is the same-origin service-worker cache/network strategy.
- The service worker became controller after reload, `registration.update()` completed, and an offline reload returned HTTP 200 with the correct title and main landmark.

## Lighthouse

Fresh mobile Lighthouse against the live URL: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP **1.7 s**, LCP **1.7 s**, TBT **0 ms**, CLS **0**. This meets the stated Lighthouse and web-vitals targets.

## Defects

### Blocker / major / minor

None found.

### Informational

The in-browser documentation demo intentionally limits files to 10 MiB and directs larger exports to the local CLI. This is a clear boundary/recovery path, not a CLI limitation or release defect.

## Reproduction

```sh
npm ci
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm run typecheck
npm test
npm run build
cargo package --allow-dirty
```

Then unpack/install the generated crate into a new Cargo root and run the documented Postman-to-Hoppscotch, lossy/environment, Bruno-directory, changed-sensitive-query, and invalid-input cases above. For the deployment, verify TLS and hashes for the listed static files, immutable cache headers on `/assets/*`, desktop/mobile browser behavior, axe, no external requests, service-worker update, and offline reload.
