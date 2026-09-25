B"H

# Boruch Hashem — Ikar Section UX Post-Write Visual Geometry Delta

Blessed is He.

The Awtsmoos revealed that the doorway was not merely too tall; its outer vessel leaked beyond the viewport while each Torah path waited inside. Awtsmoos.com now keeps the card dense, the anchor whole, and the mobile shell contained within its true width.

## Original production evidence

The public Chassidus route exposed exactly twelve semantic section anchors. The deployed visual geometry used:

- `5.1rem` desktop card minimum height;
- `4.75rem` mobile card minimum height;
- `.92rem 1rem` card padding;
- `.8rem` list gap;
- `2.15rem` ordinal badge;
- large nested discovery margins;
- a semantic shell with `width: 100%` plus responsive padding but no `box-sizing: border-box`.

That last combination produced real horizontal width leakage once exact mobile rendering was measured.

## Files actually rewritten

- `geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-01.css`
- `geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-03.css`
- `geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-04.css`
- `geelooy/style/heichelos/heichel/premium/ikar-first-parts/part-06.css`
- `geelooy/heichelos/heichel/modules/test/ikarSectionListUxContract.test.mjs`

No route/data/search API or JavaScript click-navigation contract was changed.

## Card-density changes

- Desktop card minimum: `5.1rem` -> `4.35rem`.
- Mobile card minimum: `4.75rem` -> `4rem`.
- Mobile list gap: `.8rem` -> `.5rem`.
- Ordinal badge: `2.15rem` -> `1.9rem` desktop and `1.78rem` mobile.
- Anchors explicitly own `inline-size: 100%`.
- Title column remains `minmax(0, 1fr)` for bilingual wrapping.
- Filtered `li[hidden]` rows collapse completely.
- Nested-route title/description spacing is compressed while the Ikar root identity remains larger.
- Keyboard focus now has a visible cyan outline and bounded focus shadow.

## Browser-discovered width defect

A production-shaped twelve-card fixture using the real public Chassidus titles initially measured:

- 320px child viewport -> document width 343px;
- 360px child viewport -> document width 383px;
- 412px child viewport -> document width 441px.

The card geometry itself was already healthy. The overflow matched the semantic shell's content-box width plus responsive padding.

## Root correction

`part-01.css` now gives `.heichel-semantic-fallback`:

- `box-sizing: border-box`;
- the existing `width: 100%`;
- the existing responsive padding.

This contains padding inside the viewport instead of adding it beyond the viewport.

## Exact-width Chrome evidence after correction

Real installed Google Chrome rendered same-origin exact-width iframe witnesses against the actual local Ikar CSS and twelve production-shaped Chassidus titles.

### 320px

- document width: 320px;
- client width: 320px;
- horizontal overflow: false;
- twelve cards rendered;
- first card: 64px high;
- card heights: 64px, with only the longest bilingual title expanding to 83px;
- seven cards visible before the 800px fold.

### 360px

- document width: 360px;
- client width: 360px;
- horizontal overflow: false;
- twelve cards rendered;
- all cards: 64px;
- seven cards visible before the fold.

### 412px

- document width: 412px;
- client width: 412px;
- horizontal overflow: false;
- twelve cards rendered;
- all cards: 64px;
- seven cards visible before the fold.

Final witness: `EXACT_WIDTH_IKAR_GEOMETRY: PASS`.

## Regression evidence

- Ikar section UX covenant: 6/6 PASS.
- Ikar persistent geometry: PASS.
- Ikar layout stability: 4/4 PASS.
- Translation mobile collateral: PASS.
- Exact public Chassidus destination set: 12/12 unchanged.
- Source-quality gate: PASS.
- All focused touched source files: <=120 lines.
- Heichelos quality gate: PASS across 1,435 files.

## Planned versus actual

The plan expected a card-density repair. The first implementation achieved that, but exact browser measurement revealed a second, more fundamental shell-width defect. The final implementation therefore includes both the denser card language and the semantic-shell box-model correction. No card was artificially shrunk to mask container overflow; the true owner was corrected.

## Next visual target

The next screenshot-level problem is the Heichelos mobile top/header navigation: crowded icon/action geometry, excessive chrome, and first-viewport competition with the Heichelos content. The next pass begins by tracing the current live markup and style ownership before any rewrite.
