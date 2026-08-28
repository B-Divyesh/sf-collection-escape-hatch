# Adversarial first-read review 1 — Collection Escape Hatch

**Work order:** `collection-escape-hatch-review-1`  
**Candidate:** `119befa889cef455752a6abff7a25dc02c104648`  
**Live URL:** <https://collection-escape-hatch.sociobot.in>  
**Reviewed:** 2026-08-28 UTC  
**Verdict:** **FAIL**

The page is visually distinct and its basic explanation survives a cold read. The product still fails this review: the CLI cannot be tried through the required one-command sandbox, the website's sample takes two clicks and has no demo mode, the primary install path is unusable without an undisclosed checkout, unknown routes masquerade as the home page, and no claim has a registry entry or tagged test.

## 1. Cold first screen

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 with no existing site data. No scrolling or interaction preceded these notes.

| Question | Mobile answer | Desktop answer |
| --- | --- | --- |
| What does this do? | It compares a Postman collection with a Bruno or Hoppscotch import and reports what was lost. | Same. The illustration reinforces a source-to-report inspection. |
| For whom? | A team moving API work from Postman to Bruno or Hoppscotch. | Same. |
| What should I click first? | **Install the CLI**, because it is the filled primary action. **Inspect a sample** appears as a secondary action. | Same. |

The exact copy that supplied those answers was: “Know what survived the import.”, “Compare a Postman collection with its Bruno or Hoppscotch export. Get a field-level loss report before your team changes clients.”, “Install the CLI”, and “Inspect a sample”. All three questions are answerable, so the specific cold-read blocking rule is not triggered. The visible facts and try path still fail their separate requirements in F-1-1 and F-1-22.

## 2. Findings

Findings are ordered by severity. Repeated wording that makes the same observable claim is one claim finding with every location quoted.

### Blocking

#### F-1-1 — The required CLI demo and one-click sample path do not exist

- **Exact location/quote:** first screen, “Inspect a sample”; demo controls, “Load lossy sample” and “Clear”; CLI help exposes only `verify`.
- **Evidence:** the first click on **Inspect a sample** changed the URL to `/#demo` and showed “Awaiting input / No measurement yet.” A second click on **Load lossy sample** was required before results appeared. `escape-hatch demo` in a fresh temporary directory exited 2 with `error: unrecognized subcommand 'demo'`. `/demo` and `/?demo=1` both opened an unseeded home page. There is no “Demo — sample data, nothing is saved” banner, **Reset demo**, **Start for real**, `.factory/demo.md`, `examples/` sample, or demo storage namespace.
- **Why this fails a first visitor:** the artifact class is CLI, but neither the site nor binary provides the promised setup-free, isolated way to experience the real command. The browser preview is a separate, reduced implementation and is not entered in one click.
- **Concrete fix:** ship `escape-hatch demo` with realistic bundled inputs. It must run in a temporary directory, print the report path, and leave the caller's directory untouched. Make **Try it with sample data** enter `/demo` in one click with results already rendered. Add the persistent banner, **Reset demo**, **Start for real**, isolation tests, and `.factory/demo.md`.

#### F-1-2 — The primary install action is a cold-start dead end

- **Exact location/quote:** first screen and install section, `cargo install --path .`; README, “Download a release binary for your platform, or build from source”.
- **Evidence:** `cargo install --path .` only works inside a source checkout. The page does not first tell the visitor to clone the repository. The GitHub latest-release endpoint returned 404, and the README supplies no release link.
- **Why this fails a first visitor:** the strongest action cannot be followed from the website. The README also offers a download that is not available.
- **Concrete fix:** either publish and link versioned platform binaries, or label the source-build path and give a complete clone/install sequence. Until a release exists, rewrite the README to “Build from source” and remove the unsupported download claim.

#### F-1-3 — Required routes are broken and there is no real 404

- **Exact location:** `/demo`, `/?demo=1`, and `/definitely-not-a-route`.
- **Evidence:** each returned HTTP 200 with the home title, home h1, and an empty preview. `/404` also returned the home page. There is no 404 source file.
- **Why this fails a first visitor:** a shared demo link does not enter a demo, and a mistyped URL looks valid. The routing state cannot be trusted.
- **Concrete fix:** add a real `/demo` route with seeded demo state and route-specific title. Serve a designed 404 with a non-200 status and a home link. Limit navigation fallback to known client routes and test direct load, reload, back, and forward.

### Major

#### F-1-4 — The required claims registry is absent

- **Exact location:** `.factory/claims.json` is missing; repository search found zero `@claim:` tests.
- **Why this is misleading:** the landing page, legal pages, and README make many testable promises, but the required mapping from promise to sandbox test does not exist. `npm test` passing is not a substitute for claim-tagged tests.
- **Concrete fix:** add `.factory/claims.json`. Give every claim below exactly one `@claim:<id>` test, and make each command runnable from a clean clone using only the demo inputs. Remove any promise that cannot be tested.

#### F-1-5 — Unlisted claim: supported comparison and formats

- **Quotes/locations:** landing, “Compare a Postman collection with its Bruno or Hoppscotch export”; README, “Version 0.1.1 supports Postman Collection v2.1 sources and Bruno `.bru` directories, Bruno JSON collections, or Hoppscotch JSON exports as targets.”
- **Concrete fix:** register format-specific clean-demo tests that assert successful parsing and comparison for Postman v2.1, Bruno directory, Bruno JSON, and Hoppscotch JSON inputs.

#### F-1-6 — Unlisted claim: field coverage and matching behavior

- **Quotes/locations:** landing, “Requests are matched by folder path and name. Critical fields, scripts, examples, variables, and body bytes are compared”; the coverage table; README's inventory sentence.
- **Concrete fix:** add one claim entry whose fixture changes each advertised field and asserts the corresponding observable finding, including folder/path matching.

#### F-1-7 — Unlisted claim: local, read-only operation with no requests

- **Quotes/locations:** landing, “Local only”, “Files stay in process”, “No requests sent”, and “No requests leave the machine”; README, “It never sends API requests, uploads files…” and “All verification happens in-process on your machine.”
- **Concrete fix:** register separate CLI and browser privacy tests. Deny network access for the CLI; intercept the entire browser demo and assert only the initial same-origin shell requests.

#### F-1-8 — Unlisted claim: secret and value redaction

- **Quotes/locations:** landing, “Values redacted”, “Values are not rendered or stored”; README, “Variable values are never included…” and the complete credential/query-name redaction policy.
- **Concrete fix:** register a redaction claim using unique sentinel values in variables, headers, URL credentials, and every advertised sensitive query-name variant. Assert that no sentinel appears in Markdown, JSON, stdout, stderr, or browser DOM.

#### F-1-9 — Unlisted claim: report formats and deterministic output

- **Quotes/locations:** landing, “Markdown or JSON”; README, “Include environments and produce deterministic JSON for CI”, “JSON output includes schema version `escape-hatch.report/v1`…”, and “Output order is stable…”.
- **Concrete fix:** register tests that generate both formats twice, compare bytes, validate the schema version, and confirm the documented stdout/output-file behavior.

#### F-1-10 — Unlisted claim: finding fields, CI gating, and exit codes

- **Quotes/locations:** landing, “Every finding carries a stable code, severity, artifact path, and redacted evidence” and “gate a migration fixture in CI with stable JSON and explicit exit codes”; README's finding model and exit-code table.
- **Concrete fix:** add a claim test for every documented exit code and assert all promised fields on each generated finding.

#### F-1-11 — Unlisted claim: browser memory and storage behavior

- **Quotes/locations:** landing, “This browser preview reads files in memory and makes no network calls” and “Files never leave this tab. Values are not rendered or stored”; privacy, “It never caches files you select in the demo.”
- **Evidence from this review:** a real fixture upload and sample run caused zero requests; a `real:sentinel` local/session-storage value survived sample and Clear; IndexedDB stayed empty; Cache Storage contained only the public shell. This is useful evidence, but it is not a registered build gate.
- **Concrete fix:** register that exact interception/storage/cache test and run it through the supported `/demo` entry point.

#### F-1-12 — Unlisted claim: offline operation

- **Exact location/quote:** live status, “Offline · demo still works”; privacy, “The site uses a service worker to cache its public application shell”.
- **Evidence from this review:** after one online visit, an offline reload returned 200 and the sample still produced “Changes detected”.
- **Concrete fix:** add an `offline-reload` claim entry and test a fresh demo context online, offline reload, and offline reset/re-run.

#### F-1-13 — Unlisted claim: one binary and no account

- **Exact location/quote:** “One binary. No account.”
- **Concrete fix:** register a packaged-artifact test that checks the distribution contains one executable and that the demo/verification flow never asks for authentication.

#### F-1-14 — Unlisted claim: no telemetry

- **Quotes/locations:** landing footer, “No telemetry”; README, “There is no telemetry, network client, cloud sync, or request execution in the CLI or the site demo.”
- **Concrete fix:** register a network-denial CLI test plus browser request interception. Keep “cloud sync” and “request execution” only if those behaviors are asserted too.

#### F-1-15 — Unlisted claim: build and test outputs

- **Exact location/quote:** README, “`npm test` runs Rust unit/integration tests and site tests” and “`npm run build` produces the release binary in `dist/bin/` and the deployable static site at `dist/site/`.”
- **Evidence from this review:** both commands passed in a clean clone and produced those outputs.
- **Concrete fix:** register this as a build-contract claim or move it to a separately enforced contributor contract that the claim audit explicitly excludes.

#### F-1-16 — Unlisted claim: structural limits and non-execution

- **Quotes/locations:** landing, “Structure, not behavior”; README, “The verifier compares structure; it deliberately does not execute requests or claim behavioral equivalence”; terms repeats the limit.
- **Concrete fix:** register a test with a local trap endpoint and script sentinel, then assert the tool reports structure without contacting the endpoint or evaluating the script.

#### F-1-17 — Unlisted claim: MIT licensing and vendor independence

- **Quotes/locations:** landing, “Open source under MIT”; README, “MIT licensed” and “This project is independent of those vendors.”
- **Concrete fix:** register the machine-verifiable MIT-file assertion. Keep vendor independence as legal copy only if ownership has verified it; otherwise remove it from the automated-claim surface and record the review authority.

#### F-1-18 — Root and legal-route metadata are incomplete

- **Exact location:** every live route has zero canonical links, zero Open Graph fields, zero Twitter-card fields, and zero apple-touch icons. The root title is 62 characters, exceeding the 60-character limit. `/favicon.svg` and `/apple-touch-icon.png` return 404; only the root has a data-URL favicon. There is no 1200 × 630 product image metadata.
- **Why this matters:** shared links lack product-specific context and route identity; legal pages have no favicon; duplicate route forms have no canonical source.
- **Concrete fix:** add route-specific canonical, OG, and Twitter metadata; a product-art 1200 × 630 image; SVG favicon; 180 px apple-touch icon; and shorten the root title to at most 60 characters, for example “Collection Escape Hatch — check Postman migrations”.

#### F-1-19 — Header/footer structure changes across routes and omits required identity

- **Exact location:** root header nav is Method/Coverage/Try it/Source; legal headers switch to Product plus the other legal page. Root footer has Privacy/Terms/GitHub, Privacy omits Privacy, and Terms omits Terms. No route says “Built by Param Factory” or shows a version/build id.
- **Why this matters:** visitors lose the same navigation landmarks when moving to legal pages, and there is no visible release identity for a downloadable CLI.
- **Concrete fix:** use one shared shell on every route: wordmark, no more than four stable nav links including Demo and Privacy, then a footer with the one-line description, Privacy, Terms, Built by Param Factory, and version/build id.

#### F-1-20 — Route changes do not move or announce focus

- **Exact location:** Method, Coverage, and Inspect-a-sample hash navigation.
- **Evidence:** deep links and browser Back restored the correct hash and scroll position, but `document.activeElement` remained `BODY`; there is no route-announcement live region.
- **Why this matters:** a keyboard or screen-reader user receives no confirmation of the new section.
- **Concrete fix:** focus the destination heading with `tabindex="-1"` and announce its text in a polite live region after push/pop navigation. Add forward/back focus tests.

#### F-1-21 — Search/discovery files are incomplete

- **Exact location:** `/sitemap.xml` returns 404. `robots.txt` contains only `User-agent: *` and `Allow: /`.
- **Concrete fix:** publish a sitemap containing `/`, `/demo`, `/privacy/`, and `/terms/`, and reference its absolute URL from `robots.txt`.

#### F-1-22 — The three required facts are not on the mobile first screen

- **Exact location:** at 390 × 844 the viewport ends in the hero artwork before the “Local only / No requests sent / Values redacted” rail. The first screen instead spends space on an unusable local-path install command.
- **Why this matters:** the visitor must scroll to learn privacy, offline status, and price. The mandatory first-screen shape requires three short facts adjacent to the first action.
- **Concrete fix:** put three literal facts beside the first action, for example “Runs locally”, “Works offline after first visit”, and “Free under MIT”. Link each tested claim to F-1-7, F-1-12, and F-1-17.

### Minor

#### F-1-23 — The home wordmark misses the 44 px target minimum

- **Exact location:** header home link. It measured 128 × 36 px at 390 px and 150 × 42 px on desktop.
- **Concrete fix:** give the link at least 44 px minimum block size without changing its visible mark.

#### F-1-24 — README sentence exceeds 22 words

- **Exact quote (32 words):** “It inventories a Postman Collection v2.1 and compares the structures your team depends on—folders, requests, URLs, methods, bodies, auth, scripts, examples, and variables—against a Bruno or Hoppscotch export before anyone switches clients.”
- **Concrete rewrite:** “It compares Postman v2.1 with Bruno or Hoppscotch exports. The report lists changed requests, folders, variables, auth, scripts, examples, and bodies.”

#### F-1-25 — README redaction-policy sentence exceeds 22 words

- **Exact quote (36 words):** “The query-name policy is case-insensitive (with `-` and `_` treated alike) and covers `token`, token variants, `api_key`/`apikey`, `key`, `secret`, `signature`/`sig`, `authorization`, `credential`, `password`, `session`, and `jwt`; parameter names and non-sensitive URL structure remain visible for review.”
- **Concrete rewrite:** “Sensitive query-name matching ignores case, hyphens, and underscores. It covers token, key, secret, signature, authorization, credential, password, session, and JWT variants. Reports keep parameter names and safe URL structure.”

#### F-1-26 — “Field-level loss report” is avoidable jargon

- **Exact location/quote:** hero, “Get a field-level loss report…”
- **Concrete rewrite:** “See missing or changed fields before your team switches clients.”

#### F-1-27 — “CI-shaped output” is not plain language

- **Exact location/quote:** first facts rail, “CI-shaped output”.
- **Concrete rewrite:** “Markdown and JSON reports”.

#### F-1-28 — “Reviewable artifact” and “migration fixture” obscure ordinary outputs

- **Exact quotes:** “turns … into a reviewable artifact” and “gate a migration fixture in CI”.
- **Concrete rewrites:** “creates a report your team can review” and “check saved migration examples in CI”.

#### F-1-29 — Several headings do not make sense out of context

- **Exact headings:** “Point at both sides”, “Keep the evidence”, “Field schedule”, “Put it in the checklist”, and “Make the silent loss visible.”
- **Concrete rewrites:** “Choose the source and target exports”, “Save the comparison report”, “Fields the verifier compares”, “Add the check to CI”, and “Find missing migration data”.

#### F-1-30 — The same concepts use too many names

- **Exact locations:** the operation is called check, compare, inspection, measurement, and verification; the output is report, evidence, and artifact; the interactive area is sample, browser preview, demo, and inspection bench.
- **Why this matters:** a first visitor cannot tell whether these are different capabilities.
- **Concrete fix:** use **compare** for the action, **report** for the output, and **browser demo** for the interactive area. Reserve **finding** for one report item.

#### F-1-31 — The hero Copy button does not name its result

- **Exact location/quote:** next to `cargo install --path .`, “Copy”.
- **Concrete rewrite:** “Copy install command”.

#### F-1-32 — “Inspect a sample” promises a result it does not produce

- **Exact location/quote:** first-screen secondary action, “Inspect a sample”.
- **Evidence:** it only scrolls to an empty state.
- **Concrete rewrite:** after implementing F-1-1, use “Try it with sample data” and render the sample report in that same click.

#### F-1-33 — “Clear” does not name the reset result

- **Exact location/quote:** browser preview, “Clear”.
- **Concrete rewrite:** “Reset demo”.

#### F-1-34 — “Play recorded run” and “Get the verifier” are vague actions

- **Exact locations:** recorded-run button and final call to action.
- **Concrete rewrites:** “Replay CLI comparison” and “Install the CLI”.

#### F-1-35 — README uses unexplained implementation terms

- **Exact terms:** “deterministic JSON”, “failure threshold”, “schema version”, “in-process”, “URL authority credentials”, and “interoperable input format”.
- **Concrete fix:** explain the user outcome on first use, for example “the same input produces the same JSON order”, “exit when warnings or errors occur”, “runs only on this machine”, and “credentials before the host name”. Keep schema terminology in a separate reference section.

#### F-1-36 — External links are not announced as external

- **Exact location:** header “Source ↗” hides the arrow with `aria-hidden`; footer “GitHub” has no indicator.
- **Concrete fix:** add visually hidden “(opens external site)” text or an equivalent accessible name. Use the same treatment in every shell.

## 3. Complete copy audit

Word-count method: whitespace-delimited tokens; hyphenated words and inline code each count as one. Code blocks, table cells, status counters, field labels, and navigation labels are fragments rather than sentences; the flagged headings/actions are still reviewed above.

### Landing-page sentences

| # | Words | Exact sentence |
| ---: | ---: | --- |
| 1 | 5 | Know what survived the import. |
| 2 | 10 | Compare a Postman collection with its Bruno or Hoppscotch export. |
| 3 | 10 | Get a field-level loss report before your team changes clients. |
| 4 | 8 | Source artifacts pass through a neutral structural inspection. |
| 5 | 5 | No requests leave the machine. |
| 6 | 6 | A migration check you can repeat. |
| 7 | 12 | One read-only pass turns “the import looked okay” into a reviewable artifact. |
| 8 | 17 | Use your original Postman v2.1 export and the Bruno directory or Hoppscotch JSON produced by the import. |
| 9 | 8 | Requests are matched by folder path and name. |
| 10 | 10 | Critical fields, scripts, examples, variables, and body bytes are compared. |
| 11 | 20 | Commit the Markdown report for review or gate a migration fixture in CI with stable JSON and explicit exit codes. |
| 12 | 5 | Checks what teams actually lose. |
| 13 | 12 | Every finding carries a stable code, severity, artifact path, and redacted evidence. |
| 14 | 6 | See a lossy import get caught. |
| 15 | 12 | This browser preview reads files in memory and makes no network calls. |
| 16 | 6 | The CLI performs the full comparison. |
| 17 | 5 | Files never leave this tab. |
| 18 | 6 | Values are not rendered or stored. |
| 19 | 3 | No measurement yet. |
| 20 | 9 | Load the sample or choose two exports to begin. |
| 21 | 2 | One binary. |
| 22 | 2 | No account. |
| 23 | 11 | Build locally today; release archives can carry the same binary later. |
| 24 | 5 | Make the silent loss visible. |
| 25 | 18 | Export both sides, run one local command, and review the evidence with the people who own the workflows. |
| 26 | 6 | Neutral migration evidence for API teams. |
| 27 | 4 | Open source under MIT. |
| 28 | 2 | No telemetry. |

No landing sentence exceeds 22 words. Jargon, unclear headings, inconsistent terms, and action-label failures are F-1-26 through F-1-35.

### Dynamic landing-page sentences

These strings appear after file selection, comparison, failure, or reset. Repeated empty-state sentences already listed above are counted once. `[file name]` represents the runtime filename interpolation.

| # | Words | Exact sentence/template |
| ---: | ---: | --- |
| 1 | 10 | [file name] is over the 10 MB browser preview limit. |
| 2 | 6 | Use the CLI for large exports. |
| 3 | 6 | [file name] is not valid JSON. |
| 4 | 6 | Export the collection again and retry. |
| 5 | 12 | Choose both a Postman source and Hoppscotch target, or load the sample. |
| 6 | 7 | Reading names, scopes, and field shapes locally. |
| 7 | 6 | These exports could not be inspected. |
| 8 | 8 | Source is not a Postman Collection v2.1 export. |
| 9 | 6 | Check the export version and retry. |
| 10 | 9 | Target does not look like a Hoppscotch collection export. |
| 11 | 5 | The CLI also accepts Bruno. |
| 12 | 4 | No structural differences found. |
| 13 | 5 | Continue with client-specific smoke tests. |
| 14 | 2 | Inspection stopped. |

No dynamic sentence exceeds 22 words. “Browser preview”, “comparison”, and “CLI” are included in the terminology finding F-1-30.

### README sentences

| # | Words | Exact sentence |
| ---: | ---: | --- |
| 1 | 17 | Collection Escape Hatch is a local, read-only migration verifier for teams moving API work out of Postman. |
| 2 | 32 | It inventories a Postman Collection v2.1 and compares the structures your team depends on—folders, requests, URLs, methods, bodies, auth, scripts, examples, and variables—against a Bruno or Hoppscotch export before anyone switches clients. |
| 3 | 11 | It never sends API requests, uploads files, or prints variable values. |
| 4 | 11 | Download a release binary for your platform, or build from source: |
| 5 | 20 | Version 0.1.1 supports Postman Collection v2.1 sources and Bruno `.bru` directories, Bruno JSON collections, or Hoppscotch JSON exports as targets. |
| 6 | 8 | Compare a collection and write a Markdown report: |
| 7 | 8 | Include environments and produce deterministic JSON for CI: |
| 8 | 6 | `--json` is shorthand for `--format json`. |
| 9 | 8 | Omit `--output` to print the report to stdout. |
| 10 | 22 | Variable values are never included in either format; the report records variable names and whether a value is populated or marked secret. |
| 11 | 14 | The verifier compares structure; it deliberately does not execute requests or claim behavioral equivalence. |
| 12 | 8 | Review warnings where target formats model features differently. |
| 13 | 6 | Requirements: stable Rust and Node.js 20+. |
| 14 | 9 | `npm test` runs Rust unit/integration tests and site tests. |
| 15 | 16 | `npm run build` produces the release binary in `dist/bin/` and the deployable static site at `dist/site/`. |
| 16 | 7 | The exact factory deploy directory is `dist/site`. |
| 17 | 17 | Every finding has a stable code, severity, category, artifact path, and evidence that contains no input values. |
| 18 | 13 | JSON output includes schema version `escape-hatch.report/v1`, source/target formats, inventories, findings, and a verdict. |
| 19 | 12 | Output order is stable so reports can be reviewed in pull requests. |
| 20 | 7 | All verification happens in-process on your machine. |
| 21 | 18 | There is no telemetry, network client, cloud sync, or request execution in the CLI or the site demo. |
| 22 | 22 | Treat generated reports as metadata: they contain request names, paths, methods, sanitized URLs, and variable names, but never variable values or headers. |
| 23 | 16 | URL authority credentials are replaced with `[credentials-redacted]`; query values for credential-bearing names are replaced with `[redacted]`. |
| 24 | 36 | The query-name policy is case-insensitive (with `-` and `_` treated alike) and covers `token`, token variants, `api_key`/`apikey`, `key`, `secret`, `signature`/`sig`, `authorization`, `credential`, `password`, `session`, and `jwt`; parameter names and non-sensitive URL structure remain visible for review. |
| 25 | 2 | MIT licensed. |
| 26 | 9 | See [LICENSE](LICENSE) and the maintained [format and license notes](docs/formats.md). |
| 27 | 17 | Postman Collection v2.1 is consumed as an interoperable input format; Postman is a trademark of Postman, Inc. |
| 28 | 14 | Hoppscotch exports and Bruno `.bru` files are read according to their public schemas/format documentation. |
| 29 | 7 | This project is independent of those vendors. |

Sentence 2 is F-1-24 and sentence 24 is F-1-25. README jargon is F-1-35. The false/unavailable release path is F-1-2.

### Terminology table

| Concept | Terms currently used | One term to use |
| --- | --- | --- |
| Operation | compare, check, inspect, measure, verify | compare |
| Output | report, evidence, artifact | report |
| Interactive area | sample, browser preview, demo, inspection bench | browser demo |
| One detected issue | loss, change, finding | finding |
| Input pair | both sides, artifacts, collection/export | source export and target export |

## 4. Demo and sandbox evidence

| Check | Result |
| --- | --- |
| One click from first screen shows realistic use | **Fail:** first click only scrolls to the empty preview. |
| Realistic sample after loading | Pass after a second click: Acme Orders produces 2 source requests, 1 target request, and 8 changes including method/auth/body/script loss. |
| Persistent demo banner | **Fail:** absent. |
| Reset demo | Partial: **Clear** resets the in-memory preview, but is not a demo reset and there is no demo mode. |
| Start for real | **Fail:** absent. |
| Direct demo URL | **Fail:** `/demo` and `?demo=1` are unseeded home pages. |
| CLI temp-directory demo | **Fail:** `escape-hatch demo` exits 2 as an unknown subcommand. |
| Real storage untouched | Pass for the current preview: local/session sentinel values survived; IndexedDB remained empty. |
| Selected data persists | Pass: no selected file or sample data appeared in Web Storage, IndexedDB, or Cache Storage. |
| Network privacy | Pass: sample and uploaded-fixture runs caused zero requests after shell load. |
| Offline | Pass after first visit: offline reload returned 200 and sample comparison worked. |

These manual passes do not repair F-1-4: none is a registered claim test, and the browser preview is not the required CLI demo.

## 5. Claims and clean-clone execution

`.factory/claims.json` does not exist, so there were **zero listed claim commands to run**. That is not a vacuous pass: every claim in F-1-5 through F-1-17 is unlisted and untested under the claims contract.

Independent baseline checks were run from a fresh local clone:

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 23 packages audited, 0 vulnerabilities. |
| `npm test` | Pass; 8 Rust unit tests, 5 CLI integration tests, 1 doctest, deployment policy check, and 8 Playwright tests. |
| `npm run build` | Pass; produced `dist/site/` and `dist/bin/escape-hatch`. |
| `escape-hatch demo` in a new temp directory | **Fail; exit 2, unknown subcommand.** |

## 6. History recheck

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The prior handoff and all verification reports were read. Earlier defects were rechecked rather than trusted from their status labels.

| Earlier item | Live/code recheck |
| --- | --- |
| Verification 1: TLS mismatch and Azure 404 | Fixed: normal TLS and required deployed files return 200. |
| Verification 2: changed query-string secrets leaked | Fixed: the Rust integration test passes and source applies the documented sensitive-name redaction. |
| Verification 3: hashed assets cached for 30 seconds | Fixed: live fingerprinted assets return one-year immutable caching. |
| Verification 3: missing CSP and Permissions-Policy | Fixed: both headers are present and restrictive on the live root. |
| Verification 4 / handoff: no known defects | Not sustained under this review's demo, claims, copy, and route checklist; F-1-1 through F-1-36 remain. |

No unresolved earlier finding had an `F-*` identifier to repeat.

## 7. Structure, accessibility, and visual checks

Confirmed passes:

- The live root, Privacy, and Terms routes each have `lang="en"`, one h1, and one main landmark. Heading levels do not skip.
- Privacy and Terms titles follow the required route pattern.
- Every rendered link on the landing page returned 200, including the GitHub repository.
- Deep-link scrolling and Back restored Method/Coverage positions.
- Desktop and mobile had no horizontal overflow, console error, or page error.
- The worker's `verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1, main, alt text, labeled buttons, and zero console/page errors.
- Axe reported zero violations at both sizes; focus rings and reduced-motion CSS are present.
- The hero image has useful alt text. Initial JavaScript is far below the static budget and no third-party font/script request occurs.
- The blueprint drafting-sheet identity is specific to migration inspection, matches `.factory/design.md`, and does not look like a generic gradient/card SaaS template. Asset provenance is recorded.

Failures are F-1-3 and F-1-18 through F-1-23, plus the external-link naming issue F-1-36.

## What would make this perfect

Nothing short of clearing every finding:

1. Make the CLI itself tryable with `escape-hatch demo`, and connect the first-screen action to a seeded, isolated `/demo` in one click.
2. Replace the unusable install path with a complete source-install flow or real release downloads.
3. Add the claims registry and observable clean-sandbox tests for every retained promise.
4. Add the real demo/404 routes, complete metadata and sitemap, shared shell, route focus announcements, and 44 px home link.
5. Apply every copy rewrite, then rerun the sentence and terminology audit until it has no flags.
6. Re-run this entire checklist from a fresh browser and clean clone. PASS requires zero findings and zero untested claims.
