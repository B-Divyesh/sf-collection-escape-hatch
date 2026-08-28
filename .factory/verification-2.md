# Independent verification 2 — FAIL

**Work order:** `collection-escape-hatch-verify-2`  
**Candidate:** `09b233d392564f4eeec421659d7a374c47ea7326`  
**Public URL:** `https://collection-escape-hatch.sociobot.in/`  
**Verification date:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not release.** Fresh evidence shows the prior TLS/static-hosting failure has been repaired and the live site exactly matches this candidate. However, the CLI leaks secret query-string values in its JSON/Markdown migration report whenever a URL changes. That violates the brief's local-redaction constraint and makes a report unsafe to share.

No product source or configuration was changed during this verification. Only this report and the handoff were added/updated.

## Release blocker

### Blocker — changed URLs disclose query-string secrets

Using the release binary, I compared a minimal valid Postman v2.1 collection and Hoppscotch export containing the same request path with distinct sentinel values in a `token` query parameter. The command correctly exited `1` and emitted `URL_CHANGED`, but its `evidence` field contained both sentinel values verbatim. The values came from the input URLs; they were not Postman variables or report metadata.

`safe_url()` only removes `user:password@` authority credentials. It leaves query parameters intact before the report is rendered. This contradicts the researched brief: reports must redact secret values while retaining names/structure. It also contradicts the README promise that reports never contain variable values or headers: query-string bearer/API tokens are a common secret-bearing URL form.

Required remediation: redact sensitive URL components before every report renderer sees them (at minimum query parameter values such as `token`, `api_key`, `key`, `secret`, `signature`, and `authorization`; preferably apply an explicit, documented URL-redaction policy). Add regression tests for JSON and Markdown output, including source and target changed URLs. Re-run clean-consumer verification after the fix.

## Clean candidate verification

The candidate was checked out detached into a new clean worktree, then dependencies were installed with the lockfile.

| Check | Result |
| --- | --- |
| Install | `npm ci` passed: 23 packages audited, 0 vulnerabilities. |
| Formatting/lint | `cargo fmt --check` and `cargo clippy --all-targets --all-features -- -D warnings` passed. No separate TypeScript/eslint configuration or script exists. |
| Automated tests | `npm test` passed: 7 Rust unit tests, 4 CLI integration tests, 1 doctest, and 8 Playwright tests (desktop and 390 × 844 mobile). |
| Production build | `npm run build` passed and produced `dist/site/` plus `dist/bin/escape-hatch`. |
| Package | `cargo package --allow-dirty` passed: 44 files, 313.0 KiB unpacked / 183.4 KiB compressed. |
| Consumer install | Installed the packed `target/package/collection-escape-hatch-0.1.0` into a new `cargo install --root` directory. Its sole `escape-hatch` binary exposes the documented `verify` command and help. |

The clean installed consumer exercised the public CLI as follows:

- Complete Postman v2.1 → Hoppscotch JSON: exit `0`, JSON verdict `verified`, 0 errors/0 warnings.
- Lossy Hoppscotch plus both environment files: exit `1`, including `REQUEST_MISSING` and `VARIABLE_VALUE_CHANGED`; none of the three secret fixture values appeared in the report.
- Bruno directory: auto-detected `bruno`, found two target requests; `--fail-on never` exited `0` while retaining findings.
- Invalid non-Postman source, one-sided environment input, and invalid `--fail-on` each exited `2` with actionable errors.
- The independent changed-query-URL test above exited `1` and reproduced the blocker in the release binary.

The normal/lossy fixtures cover folders, requests, methods, URLs, collection/environment variables, auth, scripts, examples, body mode, body-size loss, deterministic JSON, Markdown, CI thresholds, and redaction of ordinary variable values. The CLI has no HTTP client dependency (`cargo tree` contains clap, serde, and serde_json only); static review found no telemetry, request execution, upload, storage, or CDN font/script path.

## Live deployment — now healthy and candidate-matched

This was retested fresh rather than relying on the prior deployment-only report.

- Certificate validation succeeded (`curl` SSL verify result `0`). The presented certificate subject/SAN is `collection-escape-hatch.sociobot.in`, issued by DigiCert, valid 2026-08-27 through 2027-02-27.
- `/`, `/privacy/`, `/terms/`, `/sw.js`, the main JS, CSS, and hero WebP each returned HTTP 200 over normal TLS.
- SHA-256 hashes of live versus locally built candidate matched exactly for `index.html` (`266626…71191`), `main-CNCl0H6D.js` (`435a03…84cdd`), `styles-CmjHv4TW.css` (`46ead1…61477`), and `sw.js` (`89264d…a47029`).
- Desktop Chromium: HTTP 200; correct title, `lang=en`, one `h1`, one `main`; sample and real uploaded fixture comparison both showed `Changes detected`/`METHOD_CHANGED`; no page errors or console errors; serious/critical axe findings: 0.
- At 390 × 844: `scrollWidth == innerWidth == 390`; keyboard Tab reached the skip link; its visible focus was a coral `3px` solid outline with `3px` offset. The same sample operation worked. With reduced motion, report animation duration was `0.01s` and iteration count `1`.
- Invalid JSON and a 10 MiB + 1 byte upload produced explicit recovery guidance; loading the sample afterward and Clear both recovered correctly. Browser request capture, including a local-file demo run, observed only the same deployment origin.
- The live service worker became activated and controlled the page after reload; `registration.update()` completed; an offline reload returned HTTP 200 with the expected title and main landmark. Its generated precache and `skipWaiting`/`clients.claim` code match the candidate.
- Mobile Lighthouse against the live URL: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.3 s, LCP 1.3 s, TBT 10 ms, CLS 0.

## Budget and response-policy observations

The candidate meets static payload budgets: initial JS is 8,520 B raw / 3,602 B gzip (main plus preload), CSS is 15,992 B raw / 4,370 B gzip, the responsive mobile hero is 28,842 B, and the desktop hero is 105,922 B. No third-party network request was observed.

Live response headers include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, ETags, and correct content types. Two non-blocking deployment-policy gaps should be addressed:

- **Major:** hashed JS/CSS/image assets are served with `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching. This misses the factory performance caching policy and forces unnecessary revalidation.
- **Minor:** the live response has no Content-Security-Policy, Permissions-Policy, or cross-origin isolation policy. A restrictive static-site CSP and an explicit permissions policy would reduce the effect of future injection or supply-chain mistakes.

These do not replace the redaction blocker as the release decision: the exact candidate is live and functionally healthy, but report output is not safe for the task it claims to support.

## Recheck commands

```sh
npm ci
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npm test
npm run build
cargo package --allow-dirty
cargo install --path target/package/collection-escape-hatch-0.1.0 --root /tmp/escape-hatch-consumer
```

After redaction is fixed, run the installed binary against a source/target pair whose changed request URL has sentinel query-token values and assert neither sentinel occurs in JSON or Markdown. Then repeat the live hash, TLS, desktop/mobile, axe, PWA/offline, header/cache, and Lighthouse checks above.
