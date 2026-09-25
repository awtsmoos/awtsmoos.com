B"H

# Boruch Hashem — Ikar Density, Motion, and Geometry Delta

Blessed is He.

The Awtsmoos has now been measured in the finite vessel instead of merely imagined in CSS;
Awtsmoos.com keeps the Torah path dense, luminous, touchable, and calm across the smallest tested screens.

## Production-shaped implementation

- Preserved semantic server anchors and the concurrent `ikar-first` module split.
- Rewrote only `part-03.css`, `part-04.css`, and `part-06.css` for nested section density.
- Added `part-07.css` as the single owner of futuristic motion/depth.
- Rewrote `ikar-first.css` to import parts 01–07 in order.
- Extended `ikarSectionListUxContract.test.mjs` after implementation.

## Density changes

- Desktop card minimum: `5.1rem` -> `4.35rem`.
- Mobile card minimum: `4.75rem` -> `4rem`.
- Ordinal badge: `2.15rem` -> `1.9rem`.
- Full card anchor: explicit `inline-size: 100%`.
- Internal columns: `auto minmax(0, 1fr) auto`.
- Filtered rows: explicit `[hidden] { display: none !important; }`.
- Nested route title and description compressed on mobile while Ikar root identity remains large.
- Search-to-list spacing reduced.
- Keyboard focus uses a visible cyan outline.

## Motion language

- Shared premium easing curves rather than arbitrary timings.
- Very slow ambient grid drift on the page background only.
- Glass navigation depth responds to hover without pulsing.
- Section cards use subtle background-position light movement and `translateY(-2px)` hover/focus lift.
- Press state settles to `scale(.988)` rather than bouncing.
- Search uses `:focus-within` depth and a one-pixel lift.
- `prefers-reduced-motion` disables ambient animation and transforms.

## Quantitative visual witness

A production-shaped local fixture uses the same local Ikar CSS and the exact twelve public Chassidus titles. Headless Chrome measured three same-origin phone widths after layout.

### 320px x 800px

- Horizontal overflow: false.
- First card top: 327px.
- Normal card height: 64px.
- Longest bilingual card height: 83px.
- Cards intersecting the first 800px: 7 of 12.
- Search: 297px wide, 101px high.
- Title: 297px wide, 37px high.

### 360px x 800px

- Horizontal overflow: false.
- First card top: 327px.
- All cards: 64px high.
- Cards intersecting the first 800px: 7 of 12.
- Longest bilingual title remains inside a 64px card.

### 412px x 800px

- Horizontal overflow: false.
- First card top: 310px.
- All cards: 64px high.
- Cards intersecting the first 800px: 7 of 12.

## Verification

- Ikar section UX contract: 6/6 PASS.
- Persistent geometry: PASS.
- Ikar layout stability: 4/4 PASS.
- Translation mobile collateral: PASS.
- Exact twelve public Chassidus routes preserved.
- Source tabs/prologues/<=120-line ceilings: PASS.
- Heichelos quality gate: PASS across 1,435 files.
- Headless geometry acceptance: PASS at 320/360/412.

## Decision

Do not compress Ikar further. Seven real choices before an 800px fold with zero overflow is already a strong mobile-density result. Further reductions would trade Torah readability for artificial compactness. The next improvement belongs to cross-surface consistency: Study Sheet and global search should inherit the same restrained futuristic motion language.
