# Adversarial first-read review 2 — Collection Escape Hatch

**Work order:** `collection-escape-hatch-review-2`  
**Candidate:** `f77ce8e13495354ce13685b06375c27bfd9893ad`  
**Live URL:** <https://collection-escape-hatch.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC  
**Verdict:** **FAIL**

The cold explanation is clear and the CLI is real. The product fails because the required phone demo lands above unoperated file controls, not an already-visible finished report. The README also contains three unregistered or inaccurate operational promises.

## Cold first screen

Fresh Chromium contexts with no site data opened at 390 × 844 and 1440 × 900. No scroll or interaction occurred first.

| Question | 390 × 844 | 1440 × 900 |
| --- | --- | --- |
| What does this do? | Compare a Postman export with a Bruno or Hoppscotch migration export and show what changed. | Same. |
| For whom? | API teams moving from Postman to Bruno or Hoppscotch. | Same. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The exact source copy was “Compare your Postman migration exports”, “For API teams moving to Bruno or Hoppscotch, compare both exports before anyone switches clients.”, and “Try it with sample data”. All three cold-read answers are present. The phone first screen also has the action note and three facts. On desktop, the action starts at y=845; the action note and all facts are below y=900.

## Findings

### Blocking

#### F-2-1 (repeat of F-1-1) — The one-click mobile demo does not initially show the finished report

- **Exact location/quote:** landing primary action, “Try it with sample data”; mobile demo heading, “See a lossy migration report”.
- **Evidence:** in a fresh 390 × 844 context, clicking the action changed the URL to `/?demo=1`, showed “Demo — sample data, nothing is saved”, and focused the demo heading. Once route scrolling settled, the completed report began at y=1161, below the first demo viewport. The visible screen showed “Choose File” and “No file chosen” controls. The 8-finding report exists and **Reset demo** restores it, but it requires another scroll. At 1440 × 900 the report is visible beside the controls.
- **Why this fails:** the demo contract requires the first screen after the one click to already look like the product being used with realistic sample data. On the required phone viewport it does not. This is an unfixed/half-fixed recurrence of F-1-1.
- **Concrete fix:** make `/demo` report-first on mobile: place the completed report summary and at least `METHOD_CHANGED` above the file controls, or scroll to that report view. Extend `@claim:one-click-demo` with a settled 390 × 844 assertion that the report summary and `METHOD_CHANGED` intersect the viewport.

### Major

#### F-2-2 — The desktop first screen hides the promised result and all three facts

- **Exact location/quote:** desktop hero: “Try it with sample data”, “The sample opens a finished report in one click.”, “Runs locally”, “Works offline after first visit”, and “Free under MIT”.
- **Evidence:** at 1440 × 900, the action starts at y=845 and the action note/facts are below the viewport. The 390 × 844 layout correctly keeps them visible.
- **Why this matters:** the mandatory first-screen shape requires the result of the action and three privacy/offline/price facts beside it.
- **Concrete fix:** reduce desktop hero height or put the action, note, and facts in a compact above-fold block. Add the equivalent desktop viewport assertion.

### Minor

#### F-2-3 — README makes an unlisted claim about the test suite

- **Exact location/quote:** README: “`npm test` runs Rust tests and browser tests. It also runs every tagged claim test in `.factory/claims.json`.”
- **Why this matters:** this contributor promise has no `.factory/claims.json` entry. `build-contract` checks output directories, not test-suite coverage.
- **Concrete fix:** remove the second sentence, or register a non-recursive `@claim:test-suite-coverage` contract which proves the documented suite invokes every registered tag.

#### F-2-4 — README makes an unlisted release-availability claim

- **Exact location/quote:** README: “There are no release archives yet.”
- **Why this matters:** availability changes outside this checkout and is neither verifiable in the sandbox nor registered as a claim.
- **Concrete fix:** remove it and start with “Build from source”, or publish releases and add an appropriate release-availability check.

#### F-2-5 — The documented Node requirement is inaccurate and unlisted

- **Exact location/quote:** README: “Requirements are stable Rust and Node.js 20 or newer.”
- **Evidence:** installed Vite 7.3.6 declares `^20.19.0 || >=22.12.0`; Node 20.0–20.18 and Node 21 do not meet that range. No claim tests the stated compatibility range.
- **Why this matters:** a contributor can follow the README with a version the build tool rejects.
- **Concrete fix:** say “Requirements are stable Rust and Node.js ^20.19.0 or >=22.12.0.” Add a clean-environment compatibility check if the range remains a promise.

## Copy audit

Words are whitespace-delimited. Code blocks, table cells, labels, and buttons are interface fragments. No prose sentence exceeds 22 words and no banned marketing adjective appears. The only copy flags are F-2-3 through F-2-5.

### Landing sentences and dynamic messages

| Words | Sentence |
| ---: | --- |
| 5 | Compare your Postman migration exports. |
| 15 | For API teams moving to Bruno or Hoppscotch, compare both exports before anyone switches clients. |
| 9 | The sample opens a finished report in one click. |
| 7 | Compare exported structure without sending API requests. |
| 10 | One read-only comparison creates a report your team can review. |
| 12 | Use the original Postman v2.1 export and the Bruno or Hoppscotch export. |
| 7 | Requests match by folder path and name. |
| 10 | The CLI compares fields, scripts, examples, variables, and body bytes. |
| 5 | Review Markdown with your team. |
| 13 | Use stable JSON and exit codes to compare saved migration examples in CI. |
| 13 | Each finding includes a stable code, severity, category, artifact path, and redacted evidence. |
| 8 | The browser demo compares selected JSON in memory. |
| 9 | Use the CLI for Bruno exports and full reports. |
| 9 | Selected files stay in memory and are never stored. |
| 3 | No report yet. |
| 8 | Choose both exports or try the sample data. |
| 9 | The CLI does not send requests or run scripts. |
| 10 | It cannot prove that both API clients behave the same. |
| 13 | Reports remove variable values, headers, URL credentials, and sensitive query values before rendering. |
| 9 | Clone the repository, then install the CLI with Cargo. |
| 4 | No account is required. |
| 18 | Compare both exports, save the report, and review each finding with the people who own the API workflows. |
| 8 | Compare Postman migrations before your team switches clients. |
| 7 | Demo — sample data, nothing is saved. |
| 7 | Changes stay in a separate in-memory workspace. |
| 13 | The Acme Orders sample already shows what changed in a lossy Hoppscotch import. |
| 10 | The CLI writes its report inside a new temporary directory. |
| 7 | It leaves your current directory unchanged. |
| 9 | `[file]` is over the 10 MB browser demo limit. |
| 5 | Use the CLI for larger exports. |
| 5 | `[file]` is not valid JSON. |
| 7 | Export the file again and retry. |
| 13 | Choose both a Postman source and Hoppscotch target, or try the sample data. |
| 9 | Reading names, scopes, and field shapes on this device. |
| 8 | Source is not a Postman Collection v2.1 export. |
| 7 | Export the collection as v2.1 and retry. |
| 7 | Target is not a Hoppscotch collection export. |
| 7 | Use the CLI to compare Bruno exports. |
| 4 | No structural differences found. |
| 6 | Run client-specific smoke tests before switching. |
| 2 | Comparison stopped. |

### README sentences

| Words | Sentence |
| ---: | --- |
| 13 | Compare Postman v2.1 with Bruno or Hoppscotch exports before your team switches clients. |
| 12 | The report lists changed requests, folders, variables, auth, scripts, examples, and bodies. |
| 4 | The CLI runs locally. |
| 11 | It does not send API requests, upload files, or print secret values. |
| 8 | After installing, run one command from any directory. |
| 10 | The command copies sample exports into a new temporary directory. |
| 9 | It prints the report path and leaves your current directory unchanged. |
| 7 | The browser demo is available at the linked demo URL. |
| 10 | It opens a realistic lossy migration in one click. |
| 5 | There are no release archives yet. |
| 11 | Clone the repository before using the path-based Cargo install. |
| 7 | Version 0.1.2 accepts Postman Collection v2.1 sources. |
| 13 | Targets may be Bruno directories, Bruno JSON files, or Hoppscotch JSON exports. |
| 5 | `--json` means `--format json`. |
| 8 | Omit `--output` to print the report. |
| 8 | `--fail-on` controls when CI receives exit code 1. |
| 5 | The CLI compares exported structure. |
| 14 | It does not run requests or scripts, and it cannot prove matching client behavior. |
| 13 | Each finding includes a stable code, severity, category, artifact path, and redacted evidence. |
| 9 | The same input produces the same report order. |
| 6 | JSON reports use schema identifier `escape-hatch.report/v1`. |
| 8 | They include formats, inventory counts, findings, and a verdict. |
| 10 | The CLI and browser demo run on your device. |
| 10 | They have no accounts, telemetry, analytics, cloud sync, or request execution. |
| 7 | Reports omit headers and variable values. |
| 10 | They replace credentials before the host name with `[credentials-redacted]`. |
| 5 | Sensitive query matching ignores case. |
| 5 | Hyphens and periods match underscores. |
| 19 | The exact sensitive names are token, access_token, id_token, refresh_token, api_key, apikey, key, and secret. |
| 16 | They also include client_secret, signature, sig, authorization, credential, password, session, and jwt. |
| 7 | Reports retain parameter names and safe URL structure. |
| 8 | Requirements are stable Rust and Node.js 20 or newer. |
| 8 | `npm test` runs Rust tests and browser tests. |
| 10 | It also runs every tagged claim test in `.factory/claims.json`. |
| 12 | `npm run build` creates `dist/bin/escape-hatch` and the static site under `dist/site/`. |
| 9 | Deploy the contents of `dist/site/` to a static host. |
| 10 | The factory deploys that directory to the live site. |
| 10 | Collection Escape Hatch is free under the MIT License. |
| 9 | See LICENSE and format and license notes. |
| 9 | Postman, Bruno, and Hoppscotch name their respective products and projects. |
| 9 | This independent interoperability tool is not endorsed by those vendors. |

Headings make sense out of context. Actions are result-naming: **Try it with sample data**, **Compare exports**, **Reset demo**, **Clear selected exports**, **Replay CLI comparison**, **Copy install command**, and **Install the CLI**. Visible terminology consistently uses **compare**, **report**, **browser demo**, **finding**, **source export**, and **target export**.

## Claims, sandbox, and quality checks

I cloned to `/tmp/ceh-review-clean.PxxGRh`, ran `npm ci`, then ran every command from `.factory/claims.json` separately. All 13 passed: `one-click-demo`, `isolated-cli-demo`, `supported-formats`, `field-coverage`, `local-private`, `secret-redaction`, `report-formats`, `finding-contract`, `browser-isolation`, `offline-reload`, `one-binary-no-account`, `build-contract`, and `mit-license`.

The clean clone also passed `npm test` (8 Rust unit tests, 6 CLI integration tests, 1 doctest, 48 Playwright cases) and `npm run build` (both distribution paths produced). The Axe integration reported no serious or critical violations.

Independent sandbox exercises passed: real local/session-storage sentinels survived demo/reset; cookies and IndexedDB were empty; captured browser traffic was same-origin GET-only; offline reload retained the 8-finding report; and `escape-hatch demo` wrote under a separate `/tmp/collection-escape-hatch-demo-*` directory while leaving its temporary caller directory’s `sentinel` as the only file.

## Earlier finding recheck

Every earlier review/polish/handoff document was read. The following confirms each prior ID against live behavior and source.

| Earlier ids | Result |
| --- | --- |
| F-1-1 | **BLOCKING REGRESSION:** banner/reset/isolation exist, but mobile does not initially show the finished report; see F-2-1. |
| F-1-2 | Fixed: complete clone/source-build path and real CLI demo work. |
| F-1-3 | Fixed: seeded `/demo/` works and unknown route gives designed HTTP 404. |
| F-1-4 | Fixed: 13 registered claims and all clean-clone commands passed. |
| F-1-5 | Fixed: Postman, Bruno directory/JSON, and Hoppscotch are covered. |
| F-1-6 | Fixed: matching and every advertised field family have fixture coverage. |
| F-1-7 | Fixed: network/script trap and browser interception pass. |
| F-1-8 | Fixed: CLI and DOM sentinel redaction passes. |
| F-1-9 | Fixed: repeated Markdown/JSON bytes and schema pass. |
| F-1-10 | Fixed: stable finding fields and exits 0/1/2 pass. |
| F-1-11 | Fixed: selected files avoid persistent stores; real sentinels survive. |
| F-1-12 | Fixed: post-install offline reload/reset recomputes sample. |
| F-1-13 | Fixed: single binary/no-account demo passes. |
| F-1-14 | Fixed: no telemetry/network/cloud/non-execution checks pass. |
| F-1-15 | Fixed: clean build creates both documented output paths. |
| F-1-16 | Fixed: local trap and script sentinel prove structural-only work. |
| F-1-17 | Fixed: MIT grant and test exist. |
| F-1-18 | Fixed: metadata, icons, canonical, OG/Twitter, and route title checks pass. |
| F-1-19 | Fixed: shared header/footer include legal links, factory credit, version. |
| F-1-20 | Fixed: direct/demo/hash/back/forward focus and announcements pass. |
| F-1-21 | Fixed: robots names sitemap with all routes. |
| F-1-22 | Fixed at 390 px; desktop has new F-2-2. |
| F-1-23 | Fixed: wordmark meets 44 px target. |
| F-1-24 | Fixed: no README sentence exceeds 22 words. |
| F-1-25 | Fixed: redaction policy is split into short sentences. |
| F-1-26 | Fixed: direct migration wording replaces jargon. |
| F-1-27 | Fixed: “CI-shaped output” is absent. |
| F-1-28 | Fixed: rejected artifact/fixture wording is absent. |
| F-1-29 | Fixed: headings make sense out of context. |
| F-1-30 | Fixed: terminology is consistent. |
| F-1-31 | Fixed: copy action names result. |
| F-1-32 | Fixed in wording; F-2-1 is the remaining result-visibility defect. |
| F-1-33 | Fixed: demo says Reset demo; real mode says Clear selected exports. |
| F-1-34 | Fixed: recorded/install actions name result. |
| F-1-35 | Fixed: prior unexplained implementation terms were removed or scoped. |
| F-1-36 | Fixed: external links announce destination. |

## Structure, accessibility, and missed leverage

`/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 have route titles, one h1, main, descriptions, canonical URLs, OG/Twitter data, and icons. Every discovered internal link and both GitHub links returned 200; the 404 returns 404. Shared header/footer, mobile overflow, focus, reduced motion, and the distinctive blueprint identity all passed review. The only console resource error was the expected deliberate HTTP-404 navigation. The brief does not imply a missing AI feature: this local, private structural comparator already provides the expected imports/exports, and adding AI would weaken its core privacy/offline proposition.

## What would make this perfect

Put the completed sample report in the initial mobile demo viewport and test viewport visibility. Fit the desktop action note/facts above the fold. Remove or register the three README operational claims and state Vite’s actual Node range. Then rerun this entire review in a fresh context and clean clone.
