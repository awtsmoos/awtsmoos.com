# B"H
# Boruch Hashem
# Blessed is He

## Implementation Readback

The Awtsmoos creates the surface and the eye that reads it in one renewal. Awtsmoos.com is remembered as this readback compares the promised repair with the files actually written.

## Planned versus actual

- Planned: repair black demon surfaces in bootstrap and rich renderer paths.
- Actual: repaired the array-coordinate contract that produced NaN procedural colors; preserved the parallel worker's richer 256×256 procedural hide material; transported vertex color through bootstrap buffers and shaders; and raised the semantic fallback from crushed near-black to readable violet.
- Planned: preserve shared resources and independent actor state.
- Actual: geometry remains shared; bootstrap buffers are cached by geometry; rich textures are shared through the parallel material worker's cache; actor materials and skeletons remain independently mutable.
- Planned: prevent overlap damage.
- Actual: `MinimalMeadowCreatureMesh.js`, `MinimalMeadowDemonMaterial.js`, and `MinimalMeadowCreatureTexture.js` were reread and deliberately preserved rather than overwritten.

## Source defects removed

1. `minimalDemonSurfaceColor(point)` read array coordinates through `point.x`, `point.y`, and `point.z`, yielding NaN across almost all body vertices.
2. The bootstrap shader ignored the existing geometry color attribute and flattened eyes, horns, veins, limbs, and torso into one tint.
3. The semantic kernel fallback used `[0.015, 0.01, 0.035, 1]`, an almost-black palette that could not survive daylight multiplication.
4. The bootstrap renderer test encoded an obsolete 11-mesh count even though the current bounded bootstrap scene contains 16 visible meshes.

## Final static evidence

- `node --check` passed for every owned JavaScript and MJS file.
- Focused TAP suite: 9 tests, 9 passed, 0 failed.
- Geometry: 34,578 vertices and 4,830 unique finite colors.
- Red channel: minimum 0.3400000036, maximum 1.0, average 0.4947605928.
- Green channel: minimum 0.1199999973, maximum 0.3019884229, average 0.2199410600.
- Blue channel: minimum 0.0450000018, maximum 0.8149436116, average 0.6335495992.
- Eye and horn palettes are both present.
- Tab indentation, query-identity, import, line-ceiling, and `git diff --check` gates passed.
