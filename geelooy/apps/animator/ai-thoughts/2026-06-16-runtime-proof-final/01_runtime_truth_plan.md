B"H

# Runtime Proof Final Plan

The user is right to demand the rest. Code existence is not enough. The browser must visibly prove the authored scene is running. The old screenshots prove old skyline layers survived. Therefore the next pass must insert undeniable runtime proof into the actual canvas render path.

## Goal

1. Trace boot from `index.html` to `main.js` to app install and render loop.
2. Add a visible emergency authored scene override directly into the true `SceneComposer` path.
3. Force default scene style at startup if stale preserved state exists.
4. Add an on-canvas proof banner: `AUTHORED WORLD ACTIVE`.
5. Add browser-console breadcrumbs.
6. Add a verification script that confirms the proof nodes are present.
7. Run full verify.

## Files likely touched

- `src/main.js` if boot needs state reset.
- `src/core/app/DefaultSceneInstaller.js` to force authored scene even over old storage.
- `src/scene/core/SceneComposer.js` to make runtime branch impossible to miss.
- `src/scene/render/production/ProductionLunchScene.js` to add giant marker and complete authored scene graph.
- `tools/verify/runtimeProofSmoke.js`.
- `package.json`.

No partial patches. Every touched file rewritten whole.
