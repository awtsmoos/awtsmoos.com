B"H

# Overworld graphics revamp plan

The current overworld is generated from simple rectangles and circles. It needs a unified visual language matching the new concept mockup: rich grass, dirt paths, stone walls, roof shingles, trees, flowers, glows, signs, doors, musag rings, and ambient particles.

## Full-file rewrite plan
1. Add a small world palette module with data-based colors and seeded helpers.
2. Add world primitive helpers for rounded panels, pixel rectangles, flowers, stones, glows.
3. Rewrite Ground.js to produce richer grass, road, forest floor, flowers, sparkles, and path edge blending.
4. Rewrite Architecture.js to draw stone facades, warm shingle roofs, detailed doors, windows, and threshold shadows.
5. Split GlyphRenderer into a routing barrel plus NatureRenderer and ObjectRenderer modules.
6. Add WorldAmbience.js and call it from Projector so generated graphics have animated floating light and subtle vignette.
7. Keep every modified file complete. No partial patches.

## Verification
- node --check all rewritten modules.
- battle smoke still passes.
- a fake canvas render smoke for overworld should not crash.
