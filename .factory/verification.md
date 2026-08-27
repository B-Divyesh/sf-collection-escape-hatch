# Independent verification — FAIL

**Work order:** `collection-escape-hatch-verify-1`  
**Candidate:** `09b233d392564f4eeec421659d7a374c47ea7326` (`main`)  
**Public URL tested:** `https://collection-escape-hatch.sociobot.in/`  
**Verification date:** 2026-08-27 UTC  
**Verdict:** **FAIL — do not release this deployment.** The candidate builds and works locally, but the required live URL has an invalid TLS certificate and currently serves Azure's 404 page. These prevent users from reaching the CLI documentation/demo and mean the deployment cannot be accepted.

## Scope and method

Started from the clean checkout at the candidate SHA. Installed locked Node dependencies with `npm ci`; no product source or configuration was changed. Tested the CLI as the product of record against the brief: Postman v2.1 source, Hoppscotch and Bruno targets, folders/requests/variables/auth/scripts/examples/body changes, redaction, CI exits, malformed input, and recovery. Also tested the documentation PWA locally on desktop and 390 px mobile.

## Local candidate evidence — PASS

| Check | Result / evidence |
| --- | --- |
| Install | `npm ci`: 23 packages audited, 0 vulnerabilities. |
| Rust quality | `cargo fmt --check` and `cargo clippy --all-targets --all-features -- -D warnings`: passed. |
| Tests | `npm test`: passed. 7 Rust unit tests, 4 CLI integration tests, 1 Rust doctest, and 8 Playwright tests (desktop plus 390 x 844 mobile). Axe serious/critical findings: 0. Repository browser checks reported no console errors. |
| Production build | `npm run build`: passed; creates `dist/site/` and release `dist/bin/escape-hatch`. |
| Package | `cargo package --allow-dirty`: passed; 44 files, 313.0 KiB unpacked / 183.4 KiB compressed. |
| Clean consumer | `cargo install --path . --root /tmp/escape-hatch-consumer.…` succeeded. Installed `escape-hatch --help` exposes the single `verify` command. Complete Postman-to-Hoppscotch JSON run returned `verified`, 0 errors, 0 warnings. Bruno directory auto-detected with 2 target requests. |
| Loss and secrets | Installed binary against the lossy Hoppscotch/environment fixtures returned exit 1 with `REQUEST_MISSING` and `VARIABLE_VALUE_CHANGED`; output contained none of `do-not-print`, `different-secret`, or `fixture-secret`. One-sided environment input, non-Postman source, and invalid `--fail-on` each returned exit 2. |
| UX/accessibility | Local 390 px reduced-motion Chromium had one `<h1>`, one `<main>`, and `scrollWidth == innerWidth == 390`. The shipped Playwright suite passed desktop/mobile keyboard skip-link and primary control operation; its Axe run had no serious/critical issues. The visible focus CSS is 3 px with a 3 px offset. |
| PWA/offline | Production preview registered an activated service worker that controlled the page. After setting the browser context offline, reload returned HTTP 200 from cache with the expected title, one `<h1>`, and one `<main>`. The worker uses `skipWaiting`, `clients.claim`, and a generated hashed-asset precache manifest. |
| Privacy/network | Static review found no telemetry, API client, upload, CDN font/script, storage, or runtime third-party request path. The local demo parses selected files in memory. The only runtime `fetch` is the same-origin service-worker cache strategy; source review confirms the CLI has no network dependency. |
| Budget | Production output: JS 7,809 B raw / 3,182 B gzip (`main`); CSS 15,992 B raw / 4,370 B gzip; mobile hero 28,842 B and desktop hero 105,922 B. All are below the stated 200 KB JS, 50 KB CSS, and 300 KB hero budgets. |

## Live deployment evidence — FAIL

All checks below were fresh against the specified URL on 2026-08-27 UTC.

1. A standards-compliant Chromium navigation failed before load with `net::ERR_CERT_COMMON_NAME_INVALID`. `openssl s_client` showed a certificate for `*.msha-slice-7-eus2-0-ase.p.azurewebsites.net`; its SAN list does not include `collection-escape-hatch.sociobot.in`.
2. Diagnostic-only navigation with certificate validation disabled returned **HTTP 404**, title `Microsoft Azure Web App - Error 404`, no `<main>`, and no `Load lossy sample` button at both desktop and 390 px mobile. Browser console: `Failed to load resource: the server responded with a status of 404 (Site Not Found)`.
3. `curl --insecure` to `/`, `/assets/main-CNCl0H6D.js`, `/assets/styles-CmjHv4TW.css`, `/blueprint-crossing-700.webp`, `/sw.js`, `/privacy/`, and `/terms/` returned `404 Site Not Found` at 23:28 UTC. Therefore no usable cache policy, CSP, headers, accessibility, PWA, or bundle behavior can be accepted for the live product.
4. An earlier insecure fetch at 23:24 UTC returned an HTML document byte-identical to the locally built `dist/site/index.html` (SHA-256 `266626…71191`), but its referenced hashed JS, CSS, image, service-worker, and legal routes already returned 404. This transient/stale HTML does not establish a functioning deployment and reinforces that the deployment mapping is inconsistent.

## Defects

### Blocker

- **TLS hostname mismatch:** the certificate presented for `collection-escape-hatch.sociobot.in` does not cover that hostname. Every normal browser rejects the connection.
- **Live route/deployment missing:** the live root and required static assets/routes serve Azure `404 Site Not Found`. The product cannot load, so its CLI documentation, privacy/terms pages, demo, PWA, and response-policy checks are unavailable to users.

### Major

- **Transient inconsistent serving observed:** stale candidate HTML was briefly returned while every linked asset and route was 404. Even if the root begins returning 200 again, deployment must be reverified with all assets, legal routes, and the service worker before release.

### Minor / informational

- No candidate-code defect found in the local test scope. The brief's stated functional coverage is exercised by the shipped fixtures; format evolution and behavioral API equivalence remain documented product limitations, not release failures.

## Required remediation and recheck

Configure the custom hostname/certificate and deploy `dist/site` as one complete static root (including `assets/`, `sw.js`, image files, `/privacy/`, and `/terms/`). Then rerun live verification with certificate validation enabled, asset hashes matching the candidate, desktop/mobile browser interaction, header/cache policy, and offline PWA reload. No code change is indicated by this verification.
