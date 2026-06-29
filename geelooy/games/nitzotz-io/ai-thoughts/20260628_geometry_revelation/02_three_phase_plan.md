# B"H — Three Phase Plan

## Phase 1: Foundation
Rewrite the procedural package as the source of truth for mesh data. Add geometry transforms, generated normals, indexed-to-triangle conversion, and a shape catalog. Keep files small and complete.

Files likely touched:
- `libs/awtsmoos-procedural/src/index.js`
- `libs/awtsmoos-procedural/src/mesh/primitives.js`
- `libs/awtsmoos-procedural/src/mesh/triangles.js`
- `libs/awtsmoos-procedural/src/mesh/transform.js`
- `libs/awtsmoos-procedural/src/mesh/catalog.js`
- `libs/awtsmoos-procedural/test/smoke.mjs`

## Phase 2: Game integration
Rewrite `games/nitzotz-io/js/webgl.js` so it imports procedural catalog data and uploads real triangle buffers with normals instead of building fragile inline shapes. Keep renderer command contract unchanged: `{ mesh, pos, scale, rot, color, alpha, glow }`.

Files likely touched:
- `games/nitzotz-io/js/webgl.js`
- Maybe `games/nitzotz-io/js/engine/meshes.js` if names need remapping.

## Phase 3: Verification and readback
Run package smoke tests, module import checks for the game, and if possible a local browser smoke to detect console errors. Re-read all touched files and compare planned vs actual.

## Rules
- No partial patches. Every modified file is rewritten entirely.
- No placeholders.
- Files stay small enough to inspect.
