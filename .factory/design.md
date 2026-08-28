# Collection Escape Hatch — visual thesis

## Direction: blueprint drafting sheet

Migration verification is closer to inspecting an engineering drawing than choosing a new app. The interface is a calm, annotated drafting surface: measured grid, registration marks, line weights, callout labels, and a single coral inspection pencil. Decoration always explains the workflow—source artifacts cross a checkpoint and leave as an auditable report.

The direction is deliberately single-mode. A pale cyan paper background keeps dense technical content readable while avoiding the expected dark-terminal aesthetic. Terminal specimens use deep navy “ink” rather than becoming a separate theme.

## Tokens

- Paper/background: `#EAF4F1`; surface: `#F7FBF8`; raised surface: `#FFFFFF`.
- Blueprint ink/text: `#102D3C`; muted ink: `#4B6570`; construction line: `#A9C6C8`.
- Cobalt accent: `#075985`; accent contrast: `#FFFFFF`; pencil/coral: `#C8452D`.
- Pass: `#176B50`; warning: `#8A5600`; danger: `#A12E2E`.
- Contrast intent: body ink on paper is above 11:1; muted ink on paper above 5:1; white on cobalt above 7:1. Status never depends on color: every mark has a label and symbol.

## Type and spacing

- Interface and prose: the native humanist sans stack (`Inter` when installed, then `ui-sans-serif`, system UI). No network font requests.
- Code, measurements, and labels: `ui-monospace`, SFMono-Regular, Menlo, Consolas. Its squared rhythm supplies the drafting voice.
- Scale: 14, 16, 20, 28, 44, and fluid 64px. Body is never below 16px. Prose measure is 68 characters.
- Spacing follows an 8px base grid with 4px only for tightly related metadata. Major sections use 80–120px so the sheet can breathe.

## Interaction grammar

- Primary actions look like attached blueprint tabs: square-ish, solid cobalt, with a 2px ink outline and a small coordinate label.
- Focus is a 3px coral ring with 3px offset. Links use an underline that reads like an annotation leader.
- The live report demo is a real local parser: file input and sample load both produce a visible inspection log without upload or network activity.
- Desktop shows comparison rows across one measurement line. At 390px, rows stack into source/target/result blocks and optional ornament is removed; no horizontal page scroll.

## Motion

- One 220ms drafting reveal moves report marks upward by 6px as they appear. Button and tab feedback uses 150ms transform/ink changes.
- Nothing loops. Under `prefers-reduced-motion`, movement is removed and state changes are immediate; hierarchy remains through line weight and contrast.

## Asset plan and provenance

- `site/public/blueprint-crossing.webp` and its 700px responsive derivative are an original raster illustration generated for this product with `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment, then converted locally to WebP. Prompt: “A precise editorial blueprint illustration on pale cyan drafting paper: two API collection document stacks on the left pass through a mechanical inspection gate with calipers and checklist marks, emerging on the right as one verified report sheet; deep navy technical ink lines, restrained coral pencil annotations, orthographic/isometric hybrid, subtle paper grain, generous negative space, no people, no logos, no readable text, no gradients, no watermark; wide landing-page composition.” License: project-owned generated asset under the repository MIT license.
- Product mark, grid, arrows, and status symbols are hand-authored with CSS/inline SVG and use only simple geometric primitives. No third-party icon library or stock assets.
- `site/public/og-blueprint.png` is a 1200 × 630 crop of the original blueprint illustration. `favicon.svg` and `apple-touch-icon.png` derive from the hand-authored crossing mark. No new external asset was introduced.

## Why it fits

A migration report is evidence. Blueprint conventions make completeness, tolerances, and before/after correspondence feel inspectable without pretending the tool executes or certifies API behavior. The coral pencil signals human review where an automated comparison cannot prove semantic equivalence.
