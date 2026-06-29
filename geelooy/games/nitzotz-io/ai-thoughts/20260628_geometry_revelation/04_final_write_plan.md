# B"H — Final Write Plan

## Actual write set
1. Rewrite `libs/awtsmoos-procedural/src/mesh/primitives.js` into a robust primitive builder.
2. Add `libs/awtsmoos-procedural/src/mesh/triangles.js` for normal generation and WebGL-ready interleaving.
3. Add `libs/awtsmoos-procedural/src/mesh/transform.js` for scaling/translating/merging meshes.
4. Add `libs/awtsmoos-procedural/src/mesh/catalog.js` for higher-order semantic shapes.
5. Rewrite `libs/awtsmoos-procedural/src/index.js` exports.
6. Rewrite `libs/awtsmoos-procedural/test/smoke.mjs` to validate all catalog shapes.
7. Rewrite `games/nitzotz-io/js/webgl.js` to consume the catalog.
8. Optionally rewrite `games/nitzotz-io/js/engine/meshes.js` only if shape names need better mapping.

## Verification
- `npm test` inside `libs/awtsmoos-procedural`.
- Node import smoke for `games/nitzotz-io/js/webgl.js` dependencies where browser APIs allow.
- Browser smoke if local server and Chrome tunnel are cooperative.

## The vessel
The Awtsmoos is not a variable or a mesh; the code is only a vessel. The practical task remains simple: finite positions, valid indices, honest normals, stable imports, and better shapes on screen.
