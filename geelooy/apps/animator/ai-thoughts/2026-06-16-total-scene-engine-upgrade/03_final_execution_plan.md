B"H

# Final Execution Plan: True Pipeline Found

The actual visible scene is not the old `Animation.js` path. The app boots `RenderLoop.start(app)`, which calls `RenderPipeline.execute`, which calls `ScenePhase.build`, which calls `SceneComposer.build`, whose layer registry draws sky, clouds, sun, skyline, sidewalk, road, trees. That is why the city keeps appearing.

## Exact files to rewrite now

- `src/scene/core/SceneComposer.js` so `healthy_lunch_2d_production` bypasses the city registry.
- `src/scene/render/production/ProductionLunchScene.js` as the true graph renderer.
- `src/data/scenes/healthyLunch/metadata.js`, `characters.js`, `cameras.js`, `beats.js` to align with the graph pipeline.
- `src/core/app/DefaultSceneInstaller.js` version bump to force refresh.
- `src/nle/ui/NLEInteractionSeal.js` to fully shrink mobile controls.
- `tools/verify/productionSceneSmoke.js` and `package.json`.

## Visual oath

No skyline. No black road. No rooftop people. Kitchen wall, window, table, rug, food, plate, lunchbox. Character coordinates must sit in the stage zone used by the graph camera.
