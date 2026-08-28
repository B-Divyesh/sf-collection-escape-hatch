# Polish round 2 — finding closure

Candidate repaired: `f77ce8e13495354ce13685b06375c27bfd9893ad`  
Repair commit: `f2e7485310dd1ec44d41cfa91edcb528d954e64e`  
Live URL: <https://collection-escape-hatch.sociobot.in/>

Evidence screenshots are in `.factory/evidence/polish-2/`; `live/` was captured after deployment.

| Finding | Change made | Evidence | Live check |
| --- | --- | --- | --- |
| F-1-1 | Isolated demo retained; mobile report-first layout and scroll added. | `@claim:one-click-demo`; `live/demo-mobile.png` | Report y=148; `METHOD_CHANGED` y=617 at 390×844. |
| F-1-2 | Kept complete source-build path; removed release-availability wording. | `@claim:build-contract` | Build path is visible. |
| F-1-3 | Rechecked direct demo, route state, and HTTP 404. | direct-demo and 404 tests | `/demo/` 200; unknown route 404. |
| F-1-4 | Retained one tagged test for each claim record. | clean-clone claim loop | All 13 passed. |
| F-1-5 | Retained Postman, Bruno directory/JSON, and Hoppscotch fixtures. | `@claim:supported-formats` | Format wording matches. |
| F-1-6 | Retained full structural-field fixture comparison. | `@claim:field-coverage` | Coverage table matches. |
| F-1-7 | Retained local trap and same-origin browser interception. | `@claim:local-private` | No external origin observed. |
| F-1-8 | Retained CLI/report/DOM sentinel redaction coverage. | `@claim:secret-redaction` | Live claim passed. |
| F-1-9 | Retained deterministic Markdown/JSON/schema test. | `@claim:report-formats` | Copy matches. |
| F-1-10 | Retained stable finding fields and exit-code test. | `@claim:finding-contract` | Live claim passed. |
| F-1-11 | Retained demo/real-state, storage, cache, and size-limit isolation. | `@claim:browser-isolation` | Live claim passed. |
| F-1-12 | Retained offline reload, reset, and rerun test. | `@claim:offline-reload` | Live claim passed. |
| F-1-13 | Retained single-binary, no-account test. | `@claim:one-binary-no-account` | Live claim passed. |
| F-1-14 | Retained no telemetry/cloud/execution coverage. | local-private and isolation claims | Live suite passed. |
| F-1-15 | Retained output contract; added checked Vite Node-range contract. | `@claim:build-contract` | Both dist paths exist. |
| F-1-16 | Retained structural-only endpoint and script-marker test. | `@claim:local-private` | Live suite passed. |
| F-1-17 | Retained MIT grant check. | `@claim:mit-license` | MIT wording live. |
| F-1-18 | Rechecked route metadata, icons, social art, canonical URLs. | metadata/Axe test | Root verified live. |
| F-1-19 | Rechecked shared shell, legal links, factory credit, build id. | route test; screenshots | Present live. |
| F-1-20 | Rechecked history, focus, and polite announcements. | history/hash tests | Live suite passed. |
| F-1-21 | Rechecked robots/sitemap inventory. | deployment policy test | Routes resolve. |
| F-1-22 | Tightened desktop hero; retained mobile first screen. | first-screen test; `live/home-desktop.png` | Action/note/facts above 1440×900 fold. |
| F-1-23 | Rechecked 44px wordmark target. | keyboard/mobile test | Live suite passed. |
| F-1-24 | Rechecked concise README prose. | `.factory/copy-audit.md` | No sentence over 22 words. |
| F-1-25 | Rechecked concise redaction wording. | copy audit; redaction claim | Policy matches behavior. |
| F-1-26 | Retained verb-first headline. | copy audit; `live/home-mobile.png` | Headline live. |
| F-1-27 | Retained concrete report-format wording. | copy audit; report claim | No rejected phrase. |
| F-1-28 | Retained plain report/example wording. | copy audit | No rejected jargon. |
| F-1-29 | Rechecked standalone headings. | route/Axe test | Headings live. |
| F-1-30 | Rechecked terminology table. | `.factory/copy-audit.md` | Consistent terms live. |
| F-1-31 | Rechecked result-named copy action and feedback. | browser suite | Operable live. |
| F-1-32 | Rechecked one-click sample result. | one-click claim; demo screenshot | Completed report visible. |
| F-1-33 | Rechecked Reset demo versus Clear selected exports. | direct-demo test | Correct labels live. |
| F-1-34 | Rechecked replay/install action labels. | browser suite | Both live. |
| F-1-35 | Rechecked outcome-first README language. | copy audit | No jargon regression. |
| F-1-36 | Rechecked external-link accessible names. | external-links test | Live suite passed. |
| F-2-1 | Mobile report-first state fixes the F-1-1 recurrence. | viewport claim plus screenshot | Finished report is initial demo view. |
| F-2-2 | Desktop first-screen content is compact above fold. | first-screen test; desktop screenshot | All four required areas visible. |
| F-2-3 | Removed unsupported claim that `npm test` runs every claim. | README diff; copy audit | No unlisted suite claim. |
| F-2-4 | Removed external release-availability claim. | README diff | README starts Build from source. |
| F-2-5 | Corrected Node range and asserted it against Vite metadata. | `@claim:build-contract` | README/Vite agree. |

## Verification

- Clean clone: `/tmp/ceh-polish2-clean.XzWqgL`; `npm ci` passed with 0 vulnerabilities.
- Each of the 13 commands in `.factory/claims.json` was run separately and passed.
- The clean clone passed `npm test`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`, and `cargo package --allow-dirty`.
- `dist/bin/escape-hatch`, `dist/site/index.html`, and `target/package/collection-escape-hatch-0.1.2.crate` were produced.
- Live `verify-url.sh`: HTTP 200, 749 ms cold load, zero console/page errors, one h1/main, `lang=en`, no missing image alt or unlabeled button.
- Live Playwright: 37 passed, 13 intentional mobile claim duplicates skipped, 0 failed; Axe integration found no serious/critical violation.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1134 ms, CLS 0. Report: `.factory/evidence/polish-2/live/lighthouse.json`.
- The deployed root byte-matches `dist/site/index.html`: SHA-256 `a9b1252a5abb392814aa50e7483b6f3803710d122f64be77fd4323617e1a16a4`.

## Result

No blocker, major, or minor finding remains.
