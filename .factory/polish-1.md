# Polish round 1 — finding closure

Candidate reviewed: `119befa889cef455752a6abff7a25dc02c104648`

Review: `7faf7c94647998dd3fd0d33f656a5d2fb0fdb7a6`

Deployed product commit: `483d741061cf1b129305cbd5cb0d4ef5cd891487`

Production deployment: `0d0a860c-3005-4683-8bba-fa7bbeb6493a`

Screenshots used below:

- `.factory/evidence/polish-1/live-home-desktop.png`
- `.factory/evidence/polish-1/live-home-mobile.png`
- `.factory/evidence/polish-1/live-demo-desktop.png`
- `.factory/evidence/polish-1/live-demo-mobile.png`
- `.factory/evidence/polish-1/live-404-desktop.png`

## Every review finding

| Finding | Change made | Evidence: test and screenshot | Live URL check |
| --- | --- | --- | --- |
| F-1-1 | Added `escape-hatch demo`, bundled realistic inputs, a unique temporary workspace, seeded `?demo=1` and `/demo`, persistent demo notice, reset, exit, and separate in-memory state. | `@claim:one-click-demo`; `@claim:isolated-cli-demo`; `bundled_demo_uses_a_temp_directory_and_leaves_caller_untouched`; `live-demo-desktop.png`, `live-demo-mobile.png`. | `/?demo=1` and `/demo` both opened a finished 8-finding report cold; reset and exit passed live. |
| F-1-2 | Replaced the dead-end install action with a complete clone, `cd`, Cargo install sequence. README now states that release archives do not exist. | `one click opens the isolated demo with a finished report`; `@claim:build-contract`; `live-home-desktop.png`. | `/` shows **Build from source** beside the primary demo action and the complete command later on the page. |
| F-1-3 | Added a real demo document, direct/reload/history coverage, constrained static routing, and a designed non-200 not-found response. | `direct demo supports reset and start-for-real`; `demo history restores route metadata and focus`; `unknown routes return the designed 404 response`; `live-404-desktop.png`. | `/demo` and `/demo/` return the seeded demo; `/definitely-not-a-route` returns HTTP 404 with the designed page. |
| F-1-4 | Added `.factory/claims.json` with 13 claim records and exactly one tagged test per record. | All 13 `@claim:*` commands passed individually from clean commit `483d741`; claim tag count audit is 1 per id. | The complete claim suite also passed against production. |
| F-1-5 | Registered and tested Postman v2.1 against Hoppscotch JSON, Bruno JSON, and Bruno directory inputs. | `@claim:supported-formats`; `live-home-desktop.png`. | `/` accurately lists Bruno and Hoppscotch; live suite passed. |
| F-1-6 | Added a synthetic coverage comparison that changes every advertised request, folder, body, auth, script, example, and variable subfield. | `@claim:field-coverage`; `live-home-desktop.png`. | `/` coverage table matches the passing contract. |
| F-1-7 | Added a trap endpoint, script sentinel, dependency audit, browser upload interception, and same-origin/method/body assertions. | `@claim:local-private`; `live-demo-desktop.png`. | `/privacy/` and the live upload flow passed with no upload, request execution, or third-party request. |
| F-1-8 | Added unique sentinels for variables, headers, URL credentials, all documented query names, case, hyphen, period, JSON, Markdown, files, stdio, and DOM. | `@claim:secret-redaction`; `live-demo-desktop.png`. | `/privacy/` states the tested policy; live browser flow exposed no sentinel. |
| F-1-9 | Tested Markdown and JSON twice byte-for-byte, schema `escape-hatch.report/v1`, stdout, and output-file behavior. | `@claim:report-formats`; `live-demo-desktop.png`. | `/` describes only those tested report formats and stable CI output. |
| F-1-10 | Tested finding fields and exit codes 0, 1, and 2 with complete, lossy, and invalid inputs. | `@claim:finding-contract`; `live-demo-desktop.png`. | `/` finding contract and README exit table match observed CLI behavior. |
| F-1-11 | Selected real fixtures, preserved storage sentinels and real in-memory state, and asserted empty cookies, IndexedDB, OPFS, and selected-file cache entries. | `@claim:browser-isolation`; `live-demo-mobile.png`. | `/?demo=1` reset/Back flow passed live with only public shell files cached. |
| F-1-12 | Precached the public shell and tested online install, offline reload, reset, and comparison. | `@claim:offline-reload`; `live-demo-mobile.png`. | `/?demo=1` reloaded and reran offline in a fresh live browser context. |
| F-1-13 | Build output contains one executable; demo completes without authentication text or prompts. | `@claim:one-binary-no-account`; `live-home-desktop.png`. | `/` states one local binary and no account; live suite passed. |
| F-1-14 | Consolidated no-telemetry, no-analytics, no-cloud-sync, and no-request-execution copy under the network/storage contract. | `@claim:local-private`; `@claim:browser-isolation`; `live-home-desktop.png`. | `/privacy/` loaded with only same-origin static requests and no cookies. |
| F-1-15 | Registered the documented output directories and made every claim command build first. | `@claim:build-contract`; clean `npm run build`; `live-home-desktop.png`. | Deployed artifact came from `dist/site`; `dist/bin` contained only `escape-hatch`. |
| F-1-16 | Kept the product explicitly structural and added a local HTTP trap plus a script marker that must remain untouched. | `@claim:local-private`; `live-home-desktop.png`. | `/terms/` and `/` state the limit; live suite confirmed the browser makes no execution request. |
| F-1-17 | Registered the repository MIT grant and aligned first-screen, README, and terms wording. Vendor names remain only in legal interoperability copy. | `@claim:mit-license`; `live-home-mobile.png`. | `/terms/` and `/` show the MIT status; live suite passed. |
| F-1-18 | Added route-specific titles, descriptions, canonicals, Open Graph/Twitter metadata, 1200 × 630 art, SVG favicon, and 180 px touch icon. Root title is under 60 characters. | `every route has metadata, shared landmarks, and no serious accessibility issue`; deployment metadata/image-size assertions; `live-home-desktop.png`. | `/`, `/demo/`, `/privacy/`, `/terms/`, favicon, touch icon, and OG image all returned 200. |
| F-1-19 | Unified the header/footer on every page, including 404, with stable navigation, one-line description, factory credit, version, and polish id. | `every route has metadata, shared landmarks, and no serious accessibility issue`; `live-404-desktop.png`. | All live page routes show the shared shell and four header links. |
| F-1-20 | Route and hash transitions focus the destination heading and update a polite live region; Back and Forward restore focus and metadata. | `hash navigation moves focus and back restores it`; `demo history restores route metadata and focus`; `live-demo-desktop.png`. | History tests passed against production on desktop and mobile. |
| F-1-21 | Added `sitemap.xml` with all four routes and linked it from `robots.txt`. | Deployment discovery assertions; `live-home-desktop.png`. | `/sitemap.xml` and `/robots.txt` returned 200 with the canonical URLs. |
| F-1-22 | Rebuilt the mobile hero so the job, audience, primary sample action, next-step note, and three facts fit inside 390 × 844; decorative art is dropped on phones. | `keyboard focus, reduced motion, and mobile first screen stay usable`; `live-home-mobile.png`. | Cold 390 × 844 production screenshot shows all three facts without scrolling. |
| F-1-23 | Wordmark links now have 44 px minimum dimensions at every breakpoint. | Bounding-box assertions in `keyboard focus, reduced motion, and mobile first screen stay usable`; `live-home-mobile.png`. | Live desktop and mobile tests measured at least 44 × 44 px. |
| F-1-24 | Split the 32-word README sentence into short, concrete sentences. | `.factory/copy-audit.md`; `live-home-desktop.png`. | README at deployed commit has no sentence over 22 words. |
| F-1-25 | Split and simplified the redaction policy while retaining the exact sensitive names. | `.factory/copy-audit.md`; `@claim:secret-redaction`; `live-home-desktop.png`. | `/privacy/` uses the shorter wording; policy behavior passed live. |
| F-1-26 | Replaced “field-level loss report” with direct missing/changed-field language and a verb-first headline. | `.factory/copy-audit.md`; `live-home-mobile.png`. | `/` first screen says “Compare your Postman migration exports.” |
| F-1-27 | Replaced “CI-shaped output” with Markdown, JSON, and exit-code wording. | `.factory/copy-audit.md`; `@claim:report-formats`; `live-home-desktop.png`. | `/` uses the concrete report format names. |
| F-1-28 | Replaced “reviewable artifact” and “migration fixture” with “report your team can review” and “saved migration examples.” | `.factory/copy-audit.md`; `live-home-desktop.png`. | Cold production copy contains neither rejected phrase. |
| F-1-29 | Rewrote every unclear heading with a standalone task/result label. | `.factory/copy-audit.md`; `live-home-desktop.png`. | Live headings include “Choose the source and target exports”, “Save the comparison report”, and “Find missing migration data”. |
| F-1-30 | Standardized visible terminology to compare, report, browser demo, finding, source export, and target export. | Terminology table in `.factory/copy-audit.md`; `live-demo-desktop.png`. | Production copy scan found no former inspection/measurement/preview labels. |
| F-1-31 | Renamed the copy action to **Copy install command** and added explicit success/failure feedback. | `live-home-desktop.png`; full browser suite. | `/` exposes the result-named action in the source-install block. |
| F-1-32 | Replaced “Inspect a sample” with **Try it with sample data** and made the same click render the report. | `@claim:one-click-demo`; `live-demo-desktop.png`. | One production click changed to `?demo=1`, showed the banner, and rendered 8 findings. |
| F-1-33 | Replaced **Clear** with context-specific **Clear selected exports** outside demo and **Reset demo** inside it. | `direct demo supports reset and start-for-real`; `live-demo-mobile.png`. | Live reset restored the bundled sample report. |
| F-1-34 | Renamed actions to **Replay CLI comparison** and **Install the CLI**. | Full browser suite; `live-home-desktop.png`. | Both labels are present and operable on `/`. |
| F-1-35 | Rewrote README implementation jargon into outcome-first explanations; schema terminology remains only in the report reference. | `.factory/copy-audit.md`; `@claim:report-formats`; `live-home-desktop.png`. | README's longest prose sentence is 14 words. |
| F-1-36 | Added screen-reader-only “opens external site” text to Source, GitHub, and repository links across the shared shell. | `external links announce that they leave the site`; `live-404-desktop.png`. | External-link accessible names passed on the live site; both GitHub targets returned 200. |

## Round result

All 36 findings are closed. The full production run passed 35 browser tests with 13 intentional mobile claim duplicates skipped. Axe found no serious or critical issue on any page at desktop or 390 px. No known gap or deferred item remains.
