B"H
# Step 5 completion report

Fixed the brown-house / NPC / UI layer family.

## Changed
- `Architecture.js` rewritten: roofs are softer, less slab-like, warmer but less muddy; facades and doors are more connected and readable.
- `Human.js` rewritten: NPCs now support front/back/left/right, have varied coat colors, calmer proportions, and better side silhouettes.
- `GlyphRenderer.js` rewritten: NPCs face toward the hero; the huge overhead glyph is now a tiny crown badge.
- `WorldLabelRenderer.js` added: nearby-only, capped labels for NPCs/doors/synagogue/mitzvah stations.
- `Projector.js` rewritten: labels now render in the overlay layer before ambience/HUD.
- `index.html` rewritten: UI controls are smaller, lower, darker, and spaced farther away from labels/NPCs/houses.

## Verified
- Syntax passed for architecture, humans, glyph renderer, label renderer, projector, and index entry.
- Dynamic import of `Projector.js` passed.
- Live page on `localhost:8080/games/ohr-hagnuz/` serves the updated HTML/CSS.

## Still needs phone screenshot
Chrome capture is not enabled on this tunnel, so final pixel tuning still needs a fresh screenshot after reload.