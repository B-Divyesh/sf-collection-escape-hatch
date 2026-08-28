# Adversarial first-read review 4 — Collection Escape Hatch

**Work order:** `collection-escape-hatch-review-4`
**Candidate reviewed:** `5bd0806c0e215dfb3b3a0ebc2032114b6a2aef64`
**Live URL:** <https://collection-escape-hatch.sociobot.in/>
**Reviewed:** 2026-08-28 UTC
**Verdict:** **PASS**

This review found zero blocking, major, or minor findings. The live product is clear in a cold phone read, immediately tryable in an isolated demo, and its testable promises are registered and passing from a clean clone.

## 1. Cold first screen

Fresh Chromium contexts with no existing site data opened `/` at 390 × 844 and 1440 × 900. No scroll or interaction preceded these notes.

| Question | 390 × 844 | 1440 × 900 |
| --- | --- | --- |
| What does it do? | It compares Postman migration exports with Bruno or Hoppscotch exports, before a team changes API clients. | Same. |
| Who is it for? | API teams moving from Postman to Bruno or Hoppscotch. | Same. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The exact first-screen text was “Compare your Postman migration exports”, “For API teams moving to Bruno or Hoppscotch, compare both exports before anyone switches clients.”, and “Try it with sample data”. The action note and all three facts were visible without scrolling at both sizes. At 390 px the hero ended at y=844, with the last fact ending at y=790; the desktop facts ended at y=756. This is not a cold-read blocker.

## 2. Copy audit

Word counts use whitespace-delimited words. Navigation, field labels, table cells, status stamps, finding codes, and command examples are interface fragments rather than sentences. No audited sentence exceeds 22 words. No banned marketing adjective, unexplained product terminology, inconsistent core term, unclear heading, or non-result-naming action was found.

### Landing page and live dynamic copy

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

Checked headings: **Compare your Postman migration exports**, **Compare a migration the same way every time**, **Choose the source and target exports**, **Compare the exported structure**, **Save the comparison report**, **Find missing migration data**, **See a lossy migration report**, **Compare structure, not live behavior**, and **Install one local binary** remain understandable out of context. Checked actions: **Try it with sample data**, **Compare exports**, **Reset demo**, **Clear selected exports**, **Replay CLI comparison**, **Copy install command**, **Install the CLI**, and **Start for real** state an outcome or destination plainly.

### README

| Words | Sentence |
| ---: | --- |
| 13 | Compare Postman v2.1 with Bruno or Hoppscotch exports before your team switches clients. |
| 12 | The report lists changed requests, folders, variables, auth, scripts, examples, and bodies. |
| 4 | The CLI runs locally. |
| 11 | It does not send API requests, upload files, or print secret values. |
| 8 | After installing, run one command from any directory. |
| 10 | The command copies sample exports into a new temporary directory. |
| 9 | It prints the report path and leaves your current directory unchanged. |
| 7 | The browser demo is available at <https://collection-escape-hatch.sociobot.in/demo/>. |
| 10 | It opens a realistic lossy migration in one click. |
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
| 19 | The exact sensitive names are `token`, `access_token`, `id_token`, `refresh_token`, `api_key`, `apikey`, `key`, and `secret`. |
| 16 | They also include `client_secret`, `signature`, `sig`, `authorization`, `credential`, `password`, `session`, and `jwt`. |
| 7 | Reports retain parameter names and safe URL structure. |
| 9 | Requirements are stable Rust and Node.js ^20.19.0 or >=22.12.0. |
| 8 | `npm test` runs Rust tests and browser tests. |
| 12 | `npm run build` creates `dist/bin/escape-hatch` and the static site under `dist/site/`. |
| 9 | Deploy the contents of `dist/site/` to a static host. |
| 10 | The factory deploys that directory to the live site. |
| 10 | Collection Escape Hatch is free under the MIT License. |
| 9 | See LICENSE and format and license notes. |
| 9 | Postman, Bruno, and Hoppscotch name their respective products and projects. |
| 9 | This independent interoperability tool is not endorsed by those vendors. |

Terminology remains consistent: **compare** is the action, **report** is the output, **browser demo** is the interactive sample, **finding** is a detected difference, and **source export** / **target export** are the inputs.

## 3. Demo and sandbox

The first hero action took one click to `/?demo=1`. At both viewports it set the title to `Demo — Collection Escape Hatch`, showed the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**, and presented an Acme Orders report with 2 source requests, 1 target request, 8 findings, and visible `METHOD_CHANGED`, `AUTH_CHANGED`, `BODY_MODE_CHANGED`, `BODY_SIZE_CHANGED`, and `SCRIPT_MISSING` results. At 390 px the completed report was the initial scrolled-to view, ahead of file controls.

**Reset demo** restored the sample report. Code inspection confirms separate in-memory `demoState` and `realState` objects; the browser does not write demo inputs to cookies, Web Storage, IndexedDB, OPFS, or cache entries. The registered isolation test seeds real state, enters and resets demo, returns with Back, and confirms the original real selections remain unchanged. The offline claim test installs the worker online, turns the context offline, reloads, resets, and reruns the report. The privacy claim intercepts browser traffic and confirms same-origin GET/HEAD-only traffic; its CLI trap and script-marker checks confirm no API request or script execution.

The CLI sample is also real: `@claim:isolated-cli-demo` creates a temporary caller with `keep.txt`, runs `escape-hatch demo`, verifies that the report is in a new OS temporary workspace, and verifies that the caller retains only the sentinel file.

## 4. Claims and clean-clone evidence

I read `.factory/claims.json`, cloned the repository to `/tmp/ceh-review4.PJKY1z`, ran `npm ci`, then ran each listed command separately. Every command passed.

| Claim id | Result |
| --- | --- |
| `one-click-demo` | PASS |
| `isolated-cli-demo` | PASS |
| `supported-formats` | PASS |
| `field-coverage` | PASS |
| `local-private` | PASS |
| `secret-redaction` | PASS |
| `report-formats` | PASS |
| `finding-contract` | PASS |
| `browser-isolation` | PASS |
| `offline-reload` | PASS |
| `one-binary-no-account` | PASS |
| `build-contract` | PASS |
| `mit-license` | PASS |

The full clean-clone chain also passed: `npm test` (8 Rust unit tests, 6 CLI integrations, 1 doctest, and 50 Playwright cases with the 13 intended mobile claim duplicates skipped), `npm run build`, `cargo fmt --check`, and `cargo clippy --all-targets --all-features -- -D warnings`.

I reread live landing copy and README after the claim run. Every claim-like sentence maps to a registry entry: supported inputs and field coverage map to `supported-formats` / `field-coverage`; local processing and no execution/telemetry map to `local-private`; redaction language maps to `secret-redaction`; report and exit-code language maps to `report-formats` / `finding-contract`; demo, storage, and offline language map to the corresponding demo/isolation/offline entries; build, binary, account, and MIT language map to `build-contract`, `one-binary-no-account`, and `mit-license`. No unlisted claim was found.

## 5. Earlier findings recheck

I read every earlier `review-*`, `polish-*`, verification document, and the prior handoff. Each historical finding was checked in current source and on the live site.

| Earlier id | Current verification |
| --- | --- |
| F-1-1 | Fixed: one-click sample, mobile report-first view, banner, reset/exit, isolated browser state, and real CLI temp-dir demo pass. |
| F-1-2 | Fixed: the landing and README give the complete clone, `cd`, and Cargo source-build path. |
| F-1-3 | Fixed: `/demo/` is seeded; an unknown route returns the designed 404 with HTTP 404. |
| F-1-4 | Fixed: 13 registry entries each have one tagged passing claim test. |
| F-1-5 | Fixed: Postman v2.1, Bruno directory/JSON, and Hoppscotch JSON comparison are covered. |
| F-1-6 | Fixed: matching and advertised field families have fixture coverage. |
| F-1-7 | Fixed: local trap, script sentinel, dependency audit, and browser interception pass. |
| F-1-8 | Fixed: report and browser sentinel-redaction coverage passes. |
| F-1-9 | Fixed: repeated Markdown/JSON output and schema tests pass. |
| F-1-10 | Fixed: stable finding fields and exits 0/1/2 pass. |
| F-1-11 | Fixed: demo and real state remain separate and selected files avoid persistent stores. |
| F-1-12 | Fixed: offline reload, reset, and rerun pass. |
| F-1-13 | Fixed: one executable and no-account CLI demo pass. |
| F-1-14 | Fixed: no telemetry, cloud sync, upload, request execution, or analytics is covered. |
| F-1-15 | Fixed: clean build creates both documented distribution paths. |
| F-1-16 | Fixed: structural-only behavior is verified by the trap and script marker. |
| F-1-17 | Fixed: MIT grant has a dedicated claim test. |
| F-1-18 | Fixed: route metadata, canonical URLs, social art, and icons are present. |
| F-1-19 | Fixed: every checked route has the shared header/footer, Privacy/Terms, factory credit, and version. |
| F-1-20 | Fixed: demo/hash history restores focus and polite announcements. |
| F-1-21 | Fixed: `/robots.txt` and `/sitemap.xml` return 200 and enumerate routes. |
| F-1-22 | Fixed: the mobile and desktop first screens contain the required action note and facts. |
| F-1-23 | Fixed: the wordmark remains a 44 px target. |
| F-1-24 | Fixed: no README sentence exceeds 22 words. |
| F-1-25 | Fixed: the redaction policy remains split into short, concrete sentences. |
| F-1-26 | Fixed: direct comparison wording replaces migration-report jargon. |
| F-1-27 | Fixed: concrete Markdown/JSON/exit-code wording replaces “CI-shaped output”. |
| F-1-28 | Fixed: report/example terms replace unclear artifact/fixture copy. |
| F-1-29 | Fixed: headings are understandable outside their sections. |
| F-1-30 | Fixed: visible terminology is consistent. |
| F-1-31 | Fixed: the copy control names its result and gives feedback. |
| F-1-32 | Fixed: “Try it with sample data” produces a visible result in one click. |
| F-1-33 | Fixed: demo reset and real-mode clear controls are distinct. |
| F-1-34 | Fixed: replay and install actions name their results. |
| F-1-35 | Fixed: README implementation jargon is removed or scoped to the report reference. |
| F-1-36 | Fixed: external links announce that they leave the site. |
| F-2-1 | Fixed: current 390 px route scrolls to the completed report and visible `METHOD_CHANGED`. |
| F-2-2 | Fixed: current 1440 × 900 hero shows the action note and all facts. |
| F-2-3 | Fixed: README no longer claims that `npm test` runs every tagged claim. |
| F-2-4 | Fixed: README no longer makes a release-availability claim. |
| F-2-5 | Fixed: README states Vite's actual Node range and `build-contract` asserts it. |

## 6. Structure, routes, accessibility, and identity

Live checks at 390 px confirmed the following:

- `/`, `/demo/`, `/privacy/`, and `/terms/` each returned 200, had `lang="en"`, one `<h1>`, one `<main>`, an appropriate title, description, canonical, OG image, favicon, shared shell, Privacy, and Terms.
- `/does-not-exist` returned the designed not-found document with HTTP 404, title `Not found — Collection Escape Hatch`, one h1, and a route home.
- Every internal landing link, asset, legal route, and GitHub source link resolved successfully. `/robots.txt`, `/sitemap.xml`, the favicon, touch icon, and OG image returned 200.
- Axe found zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the 404. No horizontal overflow or ordinary route console/page error occurred. The expected browser resource message for a deliberately loaded HTTP 404 was not treated as a page-load defect.
- The pale-cyan drafting grid, technical linework, coral inspection marks, native sans/monospace pairing, and original blueprint illustration are distinct from a generic SaaS template and conform to `.factory/design.md`.

The brief does not imply a missing AI feature. This is an offline, privacy-first structural comparator; an optional remote AI step would not improve the stated job. It already includes the valuable expected import formats, Markdown/JSON export, CI exits, and a bundled sample without decorative AI or embedded provider keys.

## Findings

None.

## What would make this perfect

No product change is identified by this round. Preserve the current first-screen layout, demo isolation, claim-to-test mapping, and route/accessibility checks in future releases, then repeat this full cold-read and clean-clone audit after any material change.
