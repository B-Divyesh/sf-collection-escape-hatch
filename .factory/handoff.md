# Handoff — polish round 2

## Status

**Complete.** Repair commit `f2e7485310dd1ec44d41cfa91edcb528d954e64e` is pushed to `main` and the static site is deployed at https://collection-escape-hatch.sociobot.in.

## What changed

- Reworked the first screen so its plain-language job, demo action, action note, and three facts fit a 1440 × 900 desktop viewport.
- Made demo entry genuinely one-click on phones: `?demo=1` and the hero action focus the finished report before file controls. The persistent banner still provides **Reset demo** and **Start for real**.
- Corrected the documented Node requirement to match Vite, removed unsupported README availability and test-suite claims, and added a claim assertion for the build contract.
- Kept the existing blueprint visual system while repairing the mobile ordering and desktop hero density.
- Updated the catalog description, copy audit, claim registry, and Polish mapping. `.factory/polish-2.md` maps every historical review finding to its repair and evidence.

## Verification evidence

### Clean clone

From a fresh clone at the repaired commit:

```bash
npm ci
# Each of the 13 exact commands listed in .factory/claims.json:
npm run test:claim -- --grep "@claim:<id>"
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo package --allow-dirty
```

All 13 claim commands passed. The full Playwright suite reported 37 passing cases and 13 intentional mobile duplicate skips (50 total); Rust formatting, Clippy, package creation, and both site/binary builds passed. `dist/bin/escape-hatch`, `dist/site/index.html`, and `target/package/collection-escape-hatch-0.1.2.crate` were produced.

### Deployed site

The deployed files were checked cold at:

- https://collection-escape-hatch.sociobot.in/
- https://collection-escape-hatch.sociobot.in/demo/
- https://collection-escape-hatch.sociobot.in/privacy/
- https://collection-escape-hatch.sociobot.in/does-not-exist (designed 404)

`verify-url.sh` passed on the live root: HTTP 200, title present, `lang="en"`, exactly one h1, main landmark, no missing image alt text, and no browser errors. The live Playwright suite also passed with the same 37 pass / 13 intentional-skip result. Live site evidence is under `.factory/evidence/polish-2/live/`, including desktop/mobile/demo/404 screenshots, `verify.json`, and `lighthouse.json`.

Lighthouse mobile result on the live root: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP 1134 ms and CLS 0.

## Run locally

```bash
npm ci
npm test
npm run build
./dist/bin/escape-hatch --help
```

Serve `dist/site` for the docs site. Use `?demo=1` or `/demo/` for the isolated sample workflow.

## Remaining gaps

None known. The static deployment is intentionally made from the product repair commit; this handoff/evidence commit is documentation-only and does not change the deployed artifact.
