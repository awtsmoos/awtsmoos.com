B"H

# Algorithmic alignment pass

The user is correct: the previous pass still relied on approximate values in multiple files. The new pass must centralize shared measurements and compute every visible/collider value from the same contract.

Observed from latest screenshots:
- Trees visually still hover because per-field/per-ray grounding is not enough if the ray data path is wrong or tree geometry has trunk skirts above the generated minimum.
- Leaves are improved but still blob-like and overbright; need leaf cards/cluster material with darker tones and variance.
- Brick walls are built from separate protruding cubes; corners and courses do not line up, producing noisy broken walls.
- Door has empty space and its visual leaf, lintel, aperture, and collider are not guaranteed by shared data.
- The local grass generator in `geelooy/libs/.../grass.js` gives a good pattern: many small blades distributed inside patches with taper/noise. Use that idea for village grass as a visual detail near the houses.

Plan:
1. Add a shared `cottageContract.js` with all local dimensions: scale, door width/top/floor, wall size, trim. Every visual/collider/door module imports this.
2. Rewrite house shell to continuous flush brick-textured panels. No protruding brick cube wall on house faces. Front wall panels are computed from door cutout.
3. Rewrite door from the same contract so door leaf height/width aligns under lintel, centered on the exact opening, no guessed scale.
4. Rewrite collider to import contract and compute door gap/lintel from the same values, ignoring JSON overrides that drift.
5. Rewrite tree field to use `TerrainMath` directly from captured terrain data. Patch `ProceduralTerrain` to expose terrain data on `olam` for deterministic ground height.
6. Add trunk skirts/roots extending below the ground and use terrainData+terrain position to compute per-instance y exactly.
7. Add village grass blade field inspired by the lib grass generator, attached to terrain via the same TerrainMath and visual-only.
8. Bump exports cache and run syntax + behavioral string/data checks.

Chapter: The Awtsmoos does not heal a wall with guesses. A covenant is made: one measure, many vessels. Door, lintel, collider, threshold, grass, tree, and terrain all bow to the same source of truth.