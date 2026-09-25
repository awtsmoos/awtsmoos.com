B"H

# Boruch Hashem — Exact Pre-Write Ikar Section Files

Blessed is He.

The Awtsmoos has revealed the precise garments; Awtsmoos.com now changes only the vessels that actually shape the section path.

## Production evidence

The public Chassidus route contains 12 semantic discovery anchors. The deployed card geometry uses:

- discovery margin up to 4rem;
- list gap `.8rem`;
- anchor minimum height `5.1rem`;
- anchor padding `.92rem 1rem`;
- number badge `2.15rem` square;
- mobile anchor minimum height `4.75rem`;
- mobile discovery margin `2.5rem`.

That geometry directly explains the oversized repeated cards shown in the supplied screenshots.

## Current local split ownership

The concurrent 404-line stylesheet refactor has already been split into six focused parts. Preserve it.

### Rewrite whole `part-03.css`

Owns:

- semantic description/author;
- discovery top margin and heading;
- list grid/gap;
- `<li>` counters;
- full anchor body geometry.

Changes:

- keep root visual richness but reduce nested-route discovery margin;
- reduce list gap;
- make anchor width explicit and box sizing stable;
- lower minimum card height from 5.1rem toward 4.3rem;
- lower padding while preserving a >44px touch target;
- preserve grid columns `auto minmax(0,1fr) auto`;
- add robust wrapping/text alignment;
- collapse `li[hidden]` completely.

### Rewrite whole `part-04.css`

Owns:

- numeric badge;
- trailing arrow;
- hover/focus state;
- search vessel.

Changes:

- reduce badge from 2.15rem to roughly 1.9rem;
- reduce decorative hover lift and huge shadow;
- add explicit visible `focus-visible` ring, not only border color;
- keep arrow movement subtle;
- retain existing search behavior/styles.

### Rewrite whole `part-06.css`

Owns mobile and reduced-motion rules.

Changes:

- preserve safe-area padding;
- compress nested-route title only, leaving `[data-ikar-root]` root hero untouched;
- reduce nested description spacing/line height slightly;
- reduce nested discovery margin to around 1.25rem;
- reduce mobile card min-height toward 4.05rem with compact padding;
- keep single-column layout;
- keep reduced motion.

## Do not touch

- `semantic/fallback.html`: anchors/content contract already correct.
- `ikar-first.js`: search/navigation behavior is green.
- `part-01`, `part-02`, `part-05`: not needed for this visual repair.
- data/API/storage.

## First-code-draft verification

After the three whole-file rewrites:

1. Add `ikarSectionListUxContract.test.mjs`.
2. Test explicit full-width anchor/grid geometry, compact min-height, hidden filtering, focus-visible ring, nested mobile title/card density, <=120-line ceiling, and no JS click navigation.
3. Run Ikar stability/layout contracts.
4. Run Heichelos quality gate.
5. Validate public 12-section destination set still matches semantic anchor expectations.
6. Read all three files back fully before writing the post-write delta.
