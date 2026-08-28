# Handoff — polish round 1

## Status

**PASS.** All findings F-1-1 through F-1-36 in `.factory/review-1.md` are resolved and mapped in `.factory/polish-1.md`. No earlier review or polish report exists. No known product, test, accessibility, privacy, offline, routing, copy, or deployment gap remains.

## What shipped

- `escape-hatch demo` runs the bundled Acme Orders comparison in a unique temporary directory, writes `migration-report.md`, prints its path, and leaves the caller directory unchanged.
- The first-screen **Try it with sample data** action opens an already-completed isolated report at `?demo=1`. `/demo` is also directly shareable.
- Demo mode has a persistent “sample data, nothing is saved” banner, **Reset demo**, **Start for real**, and state separated from real file selections.
- The source install path now includes clone, directory, and Cargo commands. Unsupported release-download wording is gone.
- `.factory/claims.json` contains 13 claims with exactly one `@claim:<id>` test each.
- The site has route-specific titles and metadata, complete icons/social art, canonical URLs, a sitemap, a shared shell, focus announcements, and a designed HTTP 404.
- Mobile first-screen facts, 44 px controls, scroll-region keyboard access, reduced motion, upload error recovery, legal links, and terminology were repaired without changing the blueprint identity.
- `.factory/catalog-description.txt` is a 117-character verb-first sentence.

## Verification evidence

Clean clone of deployed source commit `483d741061cf1b129305cbd5cb0d4ef5cd891487`:

```sh
npm ci
# each of the 13 commands in .factory/claims.json, run separately
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo package --allow-dirty
```

Results:

- All 13 individual claim commands passed.
- Rust: 8 unit tests, 6 CLI integration tests, and 1 doctest passed.
- Browser: 13 claim tests and 11 site tests passed on desktop; the 11 site tests passed at 390 × 844. The 13 duplicated mobile claim cases were intentionally skipped.
- Axe: zero serious or critical violations on `/`, `/demo/`, `/privacy/`, and `/terms/` at desktop and mobile widths.
- Privacy: selected-file runs made only same-origin GET/HEAD requests with no body. No cookies, IndexedDB, OPFS entries, or selected-file cache entries were created.
- Offline: a fresh live demo context reloaded, reset, and recomputed after network access was disabled.
- Build: `dist/bin/escape-hatch` and `dist/site/` were produced. Initial JS is 4.13 KB gzip; CSS is 5.09 KB gzip; the largest loaded hero image is 105.92 KB.
- Package: `cargo package --allow-dirty` packaged and verified `collection-escape-hatch 0.1.2` successfully.
- Lighthouse mobile, live: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.3 s, CLS 0, TBT 0 ms. Summary: `.factory/evidence/polish-1/lighthouse-summary.json`.

## Deployment and cold production check

- Work-order command: `npm ci && npm run build:site`.
- Deployment command: `/opt/fleet/lib/deploy-static.sh collection-escape-hatch dist/site`.
- Azure deployment id: `0d0a860c-3005-4683-8bba-fa7bbeb6493a`.
- Live URL: <https://collection-escape-hatch.sociobot.in>.
- `/opt/fleet/lib/verify-url.sh` returned HTTP 200, the correct 52-character title, `lang=en`, one h1, one main, complete alt/button names, and zero console errors.
- Full Playwright suite against the live URL: 35 passed, 13 intentional mobile claim duplicates skipped, 0 failed.
- `/`, `/?demo=1`, `/demo`, `/demo/`, `/privacy/`, `/terms/`, both icons, the social image, `robots.txt`, and `sitemap.xml` returned 200. The unknown-route probe returned 404.
- Both repository links returned 200. CSP, Permissions Policy, Referrer Policy, and `nosniff` headers are present.

Screenshots:

- `.factory/evidence/polish-1/live-home-desktop.png`
- `.factory/evidence/polish-1/live-home-mobile.png`
- `.factory/evidence/polish-1/live-demo-desktop.png`
- `.factory/evidence/polish-1/live-demo-mobile.png`
- `.factory/evidence/polish-1/live-404-desktop.png`

## Run and release

```sh
npm ci
npm test
npm run build
dist/bin/escape-hatch demo
```

The crate is ready for `cargo package`. Registry publishing and platform release archives remain factory release operations, not product defects; the site and README explicitly provide the working source-build path meanwhile.
