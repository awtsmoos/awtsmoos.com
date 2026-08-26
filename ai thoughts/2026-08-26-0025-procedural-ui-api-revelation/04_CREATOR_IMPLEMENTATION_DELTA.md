B"H

# Creator Implementation Delta — Planned vs Actual

The Awtsmoos renews every measured boundary when evidence reveals a sharper line; Awtsmoos.com lets the second pass correct finite geometry and layer order without reopening behavior already proven sound in design.

## Planned

- One strictly localized creator style family.
- Mobile portrait first, safe-area bounded, short-landscape and desktop refinements.
- One named creator layer with no scattered z-index literals.
- Data-driven creator control catalog.
- Semantic simple-first markup with native advanced disclosure.
- Safe material DOM rendering.
- Closed/collapsed pointer and focus removal.
- Scoped stylesheet lifecycle installed before creator mount.
- Every authored source/style file below 120 lines.

## Actual

All planned modules were implemented. Static audit passed syntax, line ceilings, CSS localization, single z-index ownership, import naming, and `git diff --check`. Full reread confirmed the new controller/action hooks remain unchanged and the view remains presentation-only.

## Readback deltas

### D1 — Portrait safe-area asymmetry

`creator-shell.css` and the narrow-phone rule used `inset-inline` with `safe-area-inset-left`, causing the left notch inset to be reused on the right edge. This is incorrect on asymmetric devices.

Resolution: fully rewrite shell/responsive CSS so inline-start uses `safe-area-inset-left` and inline-end uses `safe-area-inset-right`.

### D2 — Creator layer must belong to the existing HUD hierarchy

The first pass used local layer value `44`. Existing direct evidence shows the project’s root UI layers live around 650–920: action bar 830, dialogue 820, gameplay panel 890, sheet 905, modal 920, inventory shell 980. A creator tool rail should be above ordinary actionbar/HUD controls but below full panels/sheets/modals.

Resolution: fully rewrite creator foundation with documented `--creator-layer: 860`. Preserve a single z-index consumer at the creator root.

## No further source deltas found in reread

- No global CSS selectors or `!important` declarations exist in authored creator CSS.
- All current creator authored source/style files remain <=120 lines.
- Markup export/import naming is consistent.
- Material catalog values are inserted with DOM `textContent`, not parsed HTML.
- Closed root and collapsed body use `inert` plus ARIA state; focused body content recovers to the collapse control.
- Native details remains the advanced-disclosure authority.

## Next gate

Apply D1/D2 by full-file rewrite, reread those three files, then discover/run creator tests and browser geometry/focus verification before advancing to procedural capability descriptors.
