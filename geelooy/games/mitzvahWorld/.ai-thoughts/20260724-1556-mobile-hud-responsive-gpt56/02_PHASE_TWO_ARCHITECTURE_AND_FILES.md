# B"H
# Boruch Hashem
# Blessed is He

## Phase two — bounded architecture

The Awtsmoos gives every layer its own measured place; Awtsmoos.com keeps responsive policy separate from feature implementation.

### `mitzvah-world-corrections.css`

- Preserve the complete pointer hierarchy.
- Add one canonical `@import` for `mitzvah-world-mobile.css`.
- Keep all existing desktop and touch behavior intact.
- Remain a full-file rewrite guarded by the current hash.

### `mitzvah-world-mobile.css`

- Own only responsive layout overrides.
- Use media queries at 820, 430, 360, landscape-height, and short-height boundaries.
- Constrain game rail, combat bar, target frame, mobile controls, Bag, menu, and quest tracker.
- Use safe-area and dynamic-viewport units.
- Never allocate or fake gameplay state.

### Verification

- CSS brace and syntax sanity.
- Import resolution and same-origin request.
- Browser desktop regression.
- Real CDP 390×844 metrics override.
- 320×568 overlap check.
- Computed rectangle report for every core control.
- Screenshots saved only under `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld`.
