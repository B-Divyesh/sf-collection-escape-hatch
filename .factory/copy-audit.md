# Copy audit — polish 1

Method: visible prose sentences are split at terminal punctuation. Hyphenated terms and inline code count as one word. Navigation, labels, table cells, and code are audited as interface fragments.

## First screen

| Words | Sentence |
| ---: | --- |
| 7 | Check what survived your Postman migration. |
| 15 | For API teams moving to Bruno or Hoppscotch, compare both exports before anyone switches clients. |
| 10 | The sample opens a finished report in one click. |

The headline starts with a verb and contains seven words. The next sentence names the audience, situation, and outcome. The first action is **Try it with sample data**.

## Landing page

| Words | Sentence |
| ---: | --- |
| 8 | Compare exported structure without sending API requests. |
| 10 | One read-only comparison creates a report your team can review. |
| 13 | Use the original Postman v2.1 export and the Bruno or Hoppscotch export. |
| 17 | Requests match by folder path and name. The CLI compares fields, scripts, examples, variables, and body bytes. |
| 17 | Review Markdown with your team. Use stable JSON and exit codes to check saved migration examples in CI. |
| 14 | Each finding includes a stable code, severity, category, artifact path, and redacted evidence. |
| 15 | The browser demo compares selected JSON in memory. Use the CLI for Bruno exports and full reports. |
| 16 | The CLI does not send requests or run scripts. It cannot prove that both API clients behave the same. |
| 14 | Reports remove variable values, headers, URL credentials, and sensitive query values before rendering. |
| 17 | Clone the repository, then install the CLI with Cargo. No account is required. |
| 17 | Compare both exports, save the report, and review each finding with the people who own the API workflows. |

No sentence exceeds 22 words. No banned marketing word appears.

## Dynamic and demo copy

| Words | Sentence |
| ---: | --- |
| 7 | Demo — sample data, nothing is saved. |
| 8 | Changes stay in a separate in-memory workspace. |
| 9 | Choose both exports or try the sample data. |
| 12 | Reading names, scopes, and field shapes on this device. |
| 14 | The CLI writes its report inside a new temporary directory. It leaves your current directory unchanged. |
| 15 | The Acme Orders sample already shows what changed in a lossy Hoppscotch import. |

Error messages state what failed and what to do next. No dynamic sentence exceeds 22 words.

## README

The README was rewritten into short outcome-first sentences. Its longest prose sentence is 21 words. A source scan finds no banned marketing words and no unsupported release-download claim.

## Terminology

| Concept | One term used |
| --- | --- |
| Operation | compare |
| Output | report |
| Interactive area | browser demo |
| One detected issue | finding |
| Inputs | source export and target export |

Technical compatibility names remain only where users need exact commands or schema identifiers.
