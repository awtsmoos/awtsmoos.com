B"H
# Step 5 plan: brown house, UI, NPCs

Inspected current real files:
- `Architecture.js` renders wall tiles as clipped roof/facade per tile. The top roof is too brown/blocky and doors are visually disconnected.
- `Human.js` draws all NPCs front-facing and with the same blue garment, so villagers feel cloned.
- `GlyphRenderer.js` always passes NPC direction `d` and draws a big glyph over the head.
- `Projector.js` has no current world label pass, so labels cannot be controlled/capped cleanly.
- UI CSS exists in modules and can be tuned without touching movement.

Fix batch:
1. Rewrite `Architecture.js` so roof/facade/door read as softer houses, not brown slabs.
2. Rewrite `Human.js` with variant colors and left/right/back direction support.
3. Rewrite `GlyphRenderer.js` so NPC facing responds to hero position and overhead glyphs become small crowns, not giant signs.
4. Add `WorldLabelRenderer.js` for nearby-only capped labels.
5. Rewrite `Projector.js` to call labels on overlay.
6. Tune UI CSS spacing so controls and top chips sit farther from NPC/house label space.

No movement/pathfinding/world-data changes.