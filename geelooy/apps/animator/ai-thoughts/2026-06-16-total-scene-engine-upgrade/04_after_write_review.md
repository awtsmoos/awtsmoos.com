B"H

# After Write Review: True Pipeline Scene Upgrade

## What the screenshots revealed

The old city remained because the visible browser path was not the earlier legacy `SceneRenderer`. The real path is `RenderLoop -> RenderPipeline -> ScenePhase -> SceneComposer -> SCENE_LAYER_REGISTRY`, and that registry drew sky, sun, clouds, skyline, park, and street.

## What changed now

- `src/scene/core/SceneComposer.js` now detects `healthy_lunch_2d_production` and bypasses the city registry.
- `src/scene/render/production/ProductionLunchScene.js` now builds a screen-space production kitchen: wall, window, shelves, table, plate, apple, carrot, lunchbox, rug, and badge.
- `src/core/renderer/props/PropBuilder.js` now supports graph props for apple, carrot, sandwich, plate, lunchbox, sparkle, ball, book, and box.
- `src/core/app/DefaultSceneInstaller.js` now uses version `healthy-lunch-production-v2-true-pipeline` and logs the install.
- `src/nle/ui/NLEInteractionSeal.js` now collapses mobile controls into a tiny tab.
- `tools/verify/productionSceneSmoke.js` proves SceneComposer outputs the production kitchen and not skyline/building nodes.
- `package.json` runs the new production scene smoke in full verify.

## Verification

- `npm run verify:production-scene` passed.
- `npm run verify:fast` passed.
- `npm run verify:imports` passed with 1320 files and 0 missing imports.
- Full `npm run verify` passed.
- HTTP check for the app returned 200 OK.

## Remaining if screenshot still shows city

If the browser still shows city after this, it is cached runtime state or a preserved old scene. The console should show `[DefaultSceneInstaller] True production kitchen installed`. If not, clear localStorage/site data and hard reload.
