# Copy audit — polish 2

Method: whitespace-delimited words. Hyphenated terms and inline code count as one word. Navigation, table cells, status labels, and code are interface fragments.

## First screen

| Words | Sentence |
| ---: | --- |
| 5 | Compare your Postman migration exports. |
| 15 | For API teams moving to Bruno or Hoppscotch, compare both exports before anyone switches clients. |
| 9 | The sample opens a finished report in one click. |

The headline starts with a verb. The next sentence names the audience and situation. **Try it with sample data** is the primary action. **Runs locally**, **Works offline after first visit**, and **Free under MIT** are visible at 390 × 844.

## Remaining landing-page sentences

| Words | Sentence |
| ---: | --- |
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

Headings and actions were also read out of context. They consistently use **compare** for the action, **report** for the output, **browser demo** for the interactive area, and **finding** for one reported difference.

## Demo and dynamic messages

| Words | Sentence or template |
| ---: | --- |
| 7 | Demo — sample data, nothing is saved. |
| 7 | Changes stay in a separate in-memory workspace. |
| 13 | The Acme Orders sample already shows what changed in a lossy Hoppscotch import. |
| 10 | The CLI writes its report inside a new temporary directory. |
| 7 | It leaves your current directory unchanged. |
| 9 | `[file]` is over the 10 MB browser demo limit. |
| 5 | Use the CLI for larger exports. |
| 5 | `[file]` is not valid JSON. |
| 7 | Export the collection again and retry. |
| 13 | Choose both a Postman source and Hoppscotch target, or try the sample data. |
| 9 | Reading names, scopes, and field shapes on this device. |
| 8 | Source is not a Postman Collection v2.1 export. |
| 7 | Export the collection as v2.1 and retry. |
| 7 | Target is not a Hoppscotch collection export. |
| 7 | Use the CLI to compare Bruno exports. |
| 4 | No structural differences found. |
| 6 | Run client-specific smoke tests before switching. |
| 2 | Comparison stopped. |

## README

| Words | Sentence |
| ---: | --- |
| 9 | The browser demo is available at the linked demo URL. |
| 10 | It opens a realistic lossy migration in one click. |
| 9 | Requirements are stable Rust and Node.js ^20.19.0 or >=22.12.0. |
| 8 | `npm test` runs Rust tests and browser tests. |
| 12 | `npm run build` creates `dist/bin/escape-hatch` and the static site under `dist/site/`. |

All other README prose sentences remain at or below 19 words. The release-availability sentence and the untestable test-suite-coverage sentence are removed. There is no banned marketing term.

## Terminology

| Concept | One term used |
| --- | --- |
| Operation | compare |
| Output | report |
| Interactive area | browser demo |
| One detected issue | finding |
| Inputs | source export and target export |

No sentence exceeds 22 words. No banned word appears.
