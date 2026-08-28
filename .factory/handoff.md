# Handoff — adversarial review 1

## Status

**FAIL.** The complete review is in `.factory/review-1.md`. No product source, configuration, dependency manifest, or deployment state was changed.

## What was done

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- Audited every landing-page and README sentence, terminology, heading, and action label.
- Exercised the browser sample, uploaded real fixtures, reset behavior, offline behavior, Web Storage, IndexedDB, Cache Storage, and request interception.
- Ran `escape-hatch demo` in a fresh temporary directory; it failed because the subcommand does not exist.
- Checked claims registration, direct routes, 404 behavior, titles/metadata, all landing links, back/scroll/focus behavior, the worker URL verifier, axe, touch targets, and visual identity.
- Read and rechecked the prior handoff and all four verification reports.
- Ran `npm ci`, `npm test`, and `npm run build` from a fresh clone. The existing suite and build pass.

## Main blockers

1. No real CLI demo; the website sample needs two clicks and lacks demo isolation controls/documentation.
2. The primary `cargo install --path .` action assumes an undisclosed checkout, while no downloadable release exists.
3. `/demo` is not a demo route, and unknown paths return the home page with HTTP 200 instead of a designed 404.

The claims registry is also missing, leaving every product/privacy claim without its required tagged test. See F-1-1 through F-1-36 for exact evidence and fixes.

## Reproduce

```sh
npm ci
npm test
npm run build

tmp_dir=$(mktemp -d)
(cd "$tmp_dir" && /work/repo/dist/bin/escape-hatch demo)
```

The first three commands pass. The final command exits 2 with `unrecognized subcommand 'demo'`.
