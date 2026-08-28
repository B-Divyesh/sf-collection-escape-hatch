# Handoff — adversarial review 2

## Status

**FAIL.** No product code was modified. This review adds `.factory/review-2.md` and updates this handoff only.

## What was reviewed

- Fresh live visits at 390 × 844 and 1440 × 900.
- The one-click browser demo, reset, storage isolation, request capture, and offline reload.
- `escape-hatch demo` from a temporary caller directory.
- Every registered claim command, `npm test`, and `npm run build` from a clean clone.
- Earlier review/polish/handoff closure, copy, metadata, routing, links, accessibility coverage, and visual identity.

## Verification result

- All 13 `.factory/claims.json` commands passed in `/tmp/ceh-review-clean.PxxGRh`.
- The clean suite passed: 8 Rust unit tests, 6 CLI integration tests, 1 doctest, and 48 Playwright cases.
- The clean production build produced `dist/bin/escape-hatch` and `dist/site/`.
- Browser sandbox checks passed: no persistent demo data, same-origin GET-only traffic, and offline demo reload.
- CLI demo wrote a report in its own temporary workspace and did not change the caller directory.

## Known gaps

1. **Blocking:** at 390 px, the primary demo action scrolls to file controls; the finished sample report is below the initial demo viewport. This repeats F-1-1.
2. **Major:** at 1440 × 900, the hero’s next-step note and three product facts are below the fold.
3. **Minor:** README makes two unlisted operational claims and states a Node range that conflicts with Vite 7.3.6’s engine range.

See `.factory/review-2.md` for exact evidence, fixes, copy word counts, claim results, and the complete earlier-finding recheck.

## Re-run

```sh
npm ci
npm test
npm run build
dist/bin/escape-hatch demo
```

For the primary failure, use a fresh 390 × 844 Playwright context, click the hero **Try it with sample data** action, allow route scrolling to settle, and assert the report summary plus `METHOD_CHANGED` are inside the viewport.
