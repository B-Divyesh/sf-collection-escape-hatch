# Input format and license notes

Last reviewed: 2026-08-27. These references are tracked so parser changes can be reviewed against the upstream format and its license.

| Input | Reference used | Upstream license/status | v0.1 coverage |
| --- | --- | --- | --- |
| Postman Collection v2.1 | [Official JSON schema](https://schema.postman.com/collection/json/v2.1.0/draft-07/collection.json) and [Collection SDK](https://github.com/postmanlabs/postman-collection) | Schema is published for interoperability; Collection SDK is Apache-2.0 | Source only: recursive items/folders, collection/folder/request auth inheritance, variables, events, responses, URLs, and body modes |
| Bruno `.bru` | [Bru language overview](https://docs.usebruno.com/bru-lang/overview) and [Bruno repository](https://github.com/usebruno/bruno) | MIT | Target: HTTP request files in a collection directory, metadata, methods, URL, body, auth mode, pre/post scripts, and environment variable blocks |
| Bruno JSON | [Bruno repository](https://github.com/usebruno/bruno) import/export implementations | MIT | Target: nested `items`, request method/URL/body/auth, variables, and scripts; evolving vendor-specific fields may require fixture updates |
| Hoppscotch JSON | [Import/export documentation](https://docs.hoppscotch.io/documentation/features/import-export-data) and [Hoppscotch repository](https://github.com/hoppscotch/hoppscotch) | MIT | Target: nested folders/requests, endpoint, method, body, auth type, scripts, saved responses, and variables |

Collection Escape Hatch does not redistribute vendor code or schemas. Parser fixtures in this repository are original minimal examples under the repository MIT license. Product names identify interoperable formats and do not imply endorsement.
