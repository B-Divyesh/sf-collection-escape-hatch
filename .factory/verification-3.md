# Independent verification 3 — FAIL

**Work order:** `collection-escape-hatch-verify-3`  
**Candidate:** `7be34c8dec49c1416723a894eb9a946a2c80e0c4`  
**Public URL:** `https://collection-escape-hatch.sociobot.in/`  
**Verification date:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not mark the release accepted until the static-host cache policy is fixed.** The CLI, package, live deployment, privacy behavior, PWA, accessibility, responsive behavior, and build all passed fresh tests. The deployment nevertheless violates the acceptance performance policy: every hashed static asset is served with a 30-second, revalidating cache policy rather than long-lived immutable caching. This is a hosting/deployment defect, not a candidate source-code defect.

No product code or configuration was changed by this verification. This report and `.factory/handoff.md` are the only intended repository changes.

## Clean candidate verification — PASS

I created a detached clean worktree at the exact candidate SHA, then installed only lockfile-pinned Node dependencies.

| Check | Fresh result |
| --- | --- |
| Install | `npm ci` passed: 23 packages audited, 0 vulnerabilities. |
| Static quality | `npm run typecheck`, `cargo fmt --check`, and `cargo clippy --all-targets --all-features -- -D warnings` passed. |
| Test suite | `npm test` passed: 8 Rust unit tests, 5 CLI integrations, 1 doctest, and 8 Playwright tests (desktop and 390 × 844 mobile). |
| Exact production build | `npm run build` passed and created `dist/bin/escape-hatch` plus `dist/site/` (including the PWA worker and legal pages). |
| Publish artifact | `cargo package --allow-dirty` passed: 50 files, 331.9 KiB unpacked / 189.9 KiB compressed; `collection-escape-hatch-0.1.1.crate` SHA-256 `85ea05ac177191c952352f0c398907ae326bad42e44b10f09e95fd63a61de1af`. |

## Packed-consumer CLI verification — PASS

I unpacked the generated `.crate` into a separate temporary consumer directory, installed it with a new Cargo root, and exercised only the installed `escape-hatch` binary.

- `escape-hatch --help` exposes one clear public `verify` command.
- Complete Postman v2.1 → Hoppscotch JSON returned exit `0`, JSON verdict `verified`, and zero errors.
- Lossy Hoppscotch plus paired environments returned exit `1` with `REQUEST_MISSING`, `VARIABLE_MISSING`, and `VARIABLE_VALUE_CHANGED`; report output contained none of `do-not-print`, `different-secret`, or `fixture-secret`.
- Bruno directory auto-detection returned target format `bruno` with two target requests; `--fail-on never` returned exit `0` while preserving findings.
- A changed URL with four sentinel query secrets returned exit `1`, wrote Markdown through `--output`, retained `token=[redacted]`, `api_key=[redacted]`, and `page=1`, and leaked none of the sentinel values.
- Invalid source format, one-sided environment inputs, and invalid `--fail-on` each returned the documented exit `2` with actionable stderr. This covers normal, loss, boundary/CI threshold, invalid-input, and recovery paths for the brief's supported formats.

The CLI dependency tree contains only `clap`, `serde`, and `serde_json`; it has no HTTP client. Source review found no telemetry, API execution, upload, cloud storage, analytics, or runtime third-party script/font path.

## Live deployment and browser verification — PASS

All live evidence below was collected fresh with ordinary TLS verification enabled.

- HTTPS root, `/privacy/`, `/terms/`, `/sw.js`, main JS/CSS, and both WebP assets returned HTTP 200. `curl` reported `ssl_verify=0`.
- Built candidate and live bytes match exactly for the root HTML, privacy/terms HTML, service worker, main JS, CSS, and both hero images. For example: root `2666261bea384c9f006c1830e359dd20b9dfb0dd1231eb4fe22cec8093571191`, main JS `435a0370ce712e1faef09dbff159d0e07ceb9cabcdcdfa4aa1070f1968184cdd`, CSS `46ead1b8e6f50ec8ea78ae15d8fe045e4f5049bfda6ea20e5a778fa60961477e`, and worker `89264dd328375c2d2226c0f9b76ceaabde085d1e0875a45a7bdb0b2f71a47029`.
- Desktop Chromium: correct title, `lang=en`, one `h1`, and one `main`; no console or page errors. Empty Run inspection gives recovery guidance; the lossy sample finds `METHOD_CHANGED`; Clear restores the empty state; malformed JSON reports a recovery error and the sample then works again.
- Keyboard-only desktop use reached the skip link first. Its computed visible focus was `rgb(200, 69, 45) solid 3px` with `3px` offset.
- Fresh axe scan found **0 serious/critical** violations.
- At 390 × 844, `scrollWidth == innerWidth == 390`, keyboard skip-link use and lossy sample work, and reduced motion reports an animation duration of `0.00001s` with one iteration.
- Request capture observed no external origin. The page demo processed the test data locally.
- The service worker became controller after reload; `registration.update()` completed. With the browser offline, reload returned HTTP 200 from cache with the expected title.
- Mobile Lighthouse produced Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.1 s, TBT 100 ms, CLS 0. (Lighthouse printed a browser-tab crash during cleanup after writing the complete report and scores.)

## Payload and response-policy evidence

The candidate fits the static payload budgets: initial main JS is 7,809 B raw / 3,183 B gzip, CSS 15,992 B raw / 4,354 B gzip, mobile hero 28,842 B, and desktop hero 105,922 B. There are no shipped web fonts or third-party runtime assets. The service worker precaches the shell and uses `skipWaiting` plus `clients.claim`.

Live responses include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, ETag, and appropriate content types. The following defects remain.

## Defects

### Major — static assets are not immutable cached

`/assets/main-CNCl0H6D.js`, `/assets/styles-CmjHv4TW.css`, both hashed/immutable content assets, the worker, HTML, and images all return:

```text
Cache-Control: public, must-revalidate, max-age=30
```

The performance acceptance contract requires long-lived immutable caching for hashed assets. A 30-second revalidation policy defeats that benefit and is not an acceptable static-host policy for this deployment. Configure the host so hashed JS/CSS/images use a long max-age with `immutable` (for example, one year); HTML and the service-worker entry may remain short-lived/revalidating to support updates. Re-run the live header and offline/update checks afterward.

### Minor — missing explicit browser security policy

The live responses do not send `Content-Security-Policy` or `Permissions-Policy`. The site has no third-party resources and passed functional/privacy checks, so this is defense-in-depth rather than the release blocker. A restrictive static CSP and explicit permissions policy are recommended.

## Recheck commands

```sh
npm ci
npm run typecheck
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm test
npm run build
cargo package --allow-dirty
```

Then install the unpacked crate into a new Cargo root and repeat complete, lossy/environment, Bruno, query-redaction, and invalid-input CLI exercises. For deployment acceptance, verify TLS, candidate hashes, desktop/390 px keyboard/axe/reduced-motion behavior, service-worker offline reload/update, no third-party requests, and asset headers showing a long-lived `immutable` policy for hash-named assets.
