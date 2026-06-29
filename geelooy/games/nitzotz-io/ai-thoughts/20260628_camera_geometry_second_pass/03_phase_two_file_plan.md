# B"H — Phase Two File Plan

## New game files
- `js/camera/config.js`
- `js/camera/obstacles.js`
- `js/camera/rig.js`
- `js/render/frame.js`
- `js/render/draw.js`
- `js/render/matrix.js`
- `js/render/viewport.js`
- `js/renderList/command.js`
- `js/renderList/culling.js`
- `js/renderList/objects.js`
- `js/renderList/particles.js`
- `js/renderList/portal.js`
- `js/renderList/radar.js`
- `js/renderList/terrain.js`
- `js/renderList/index.js`
- `test/smoke.mjs`

## Rewritten game files
- `js/game.js`
- `js/renderer.js`
- `js/engine/renderList.js` wrapper
- `js/engine/streamer.js`
- `js/engine/city.js`
- `js/engine/meshes.js`
- `js/level.js`
- `js/save.js`
- `js/state.js`

## New procedural split files
- `src/mesh/primitives/core.js`
- `src/mesh/primitives/box.js`
- `src/mesh/primitives/flat.js`
- `src/mesh/primitives/round.js`
- `src/mesh/primitives/star.js`
- `src/mesh/catalog/registry.js`
- `src/mesh/catalog/glyphs.js`
- `src/mesh/catalog/structures.js`
- `src/mesh/catalog/nature.js`

## Rewritten procedural files
- `src/mesh/primitives.js` as a small compatibility barrel.
- `src/mesh/catalog.js` as a small compatibility barrel.
- `src/index.js` exports remain stable.
- `test/smoke.mjs` adds stronger catalog coverage.
