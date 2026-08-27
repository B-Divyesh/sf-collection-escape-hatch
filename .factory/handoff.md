# Handoff — Collection Escape Hatch v0.1.0

## What was built

- A release-ready Rust/Clap single-binary CLI, `escape-hatch`, for Postman Collection v2.1 → Hoppscotch JSON, Bruno JSON, or Bruno `.bru` directory verification.
- Recursive, path-based comparison of folders and requests plus method, URL, body mode/size, effective auth type, scripts (event, line count, and redacted content fingerprint), saved examples, collection/environment variables, secret classification, and redacted value fingerprints.
- Stable Markdown and JSON report schemas, `--json`, optional environment pairs, explicit target detection, configurable CI thresholds, and exit codes 0/1/2. The tool never executes a request or initializes a network client.
- Original fixtures for a lossless migration, a deliberately lossy migration, environments with secret values, and a Bruno directory. Reports never contain the fixture secret strings.
- A responsive Vite documentation site in the required blueprint-drafting-sheet direction, including an original generated hero, local in-browser Hoppscotch preview, recorded CI trace, empty/loading/error/offline states, keyboard focus, privacy and terms pages, and an offline service-worker cache.
- Public documentation: README usage first, CLI boundaries, MIT license, changelog, and upstream format/license tracking in `docs/formats.md`.

## Run and verify

```sh
npm install
npm test
npm run build
cargo package
```

- `npm test`: passed. Rust: 7 unit tests, 4 CLI integration tests, and 1 compiling doctest. Browser: 8 Playwright checks across desktop Chromium and a 390×844 Chromium mobile profile, including Axe serious/critical checks, keyboard use, local demo behavior, legal pages, and console errors.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `npm audit`: 0 vulnerabilities.
- `npm run build`: passed from the documented command. Static deploy root is exactly `dist/site/index.html`; optimized binary is `dist/bin/escape-hatch`.
- `cargo package --allow-dirty`: passed and verified the crate. On the final committed tree, use `cargo package` without the flag. The factory should publish; this worker did not.
- Factory `verify-url.sh`: HTTP 200; title present; `lang=en`; one `<h1>`; `<main>` present; 0 images missing alt; 0 unlabeled buttons; 0 console/page errors.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.2 s, CLS 0, total blocking time 0 ms (lab proxy; INP is not available without field interaction data).
- Initial payload: 7.81 KB authored main JavaScript plus a 0.71 KB shared style loader, 15.99 KB CSS, 29 KB mobile hero / 104 KB desktop hero. This is below the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

## Known gaps and next steps

- This is structural migration evidence, not behavioral certification: client-specific script APIs and actual network behavior still need non-production smoke tests.
- The browser preview intentionally covers a useful Hoppscotch subset; the CLI is the authoritative verifier and also supports Bruno.
- Bruno and Hoppscotch export shapes evolve. Add anonymized fixtures when upstream versions change, using the references in `docs/formats.md`.
- GraphQL/WebSocket-specific Bruno blocks are not interpreted in v0.1; unsupported body modes are still surfaced as mode/size changes where present.
- Factory success measurement across 10 anonymized real-world collections remains a post-release validation task; current coverage uses purpose-built end-to-end fixtures.
- Cross-platform release archives are not produced here. The factory can compile them from the packaged crate and attach them to a release.
