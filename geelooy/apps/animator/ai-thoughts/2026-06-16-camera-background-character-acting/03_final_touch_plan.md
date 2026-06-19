B"H

# Final Touch Plan

Confirmed root cause: `StageLayerComposer` places `sceneNode` in `screen_scene_layer`, outside `camera_world`, while actors are inside `camera_world`. The background therefore never moves with camera. Fix by making the authored kitchen a world-stage and composing it under the same camera transform as entities.

Touch files:
- `src/core/renderer/pipeline/layers/StageLayerComposer.js` — scene goes inside camera world.
- `src/scene/render/production/ProductionLunchScene.js` — switch from screen pixel layout to world-coordinate kitchen set.
- `src/data/scenes/healthyLunch/cameras.js` — reduce dead-wall wide shots, avoid destructive close insert.
- `src/data/scenes/healthyLunch/characters.js` — better expressive defaults, not renderer replacement.
- `src/core/app/director/logic/SpeechProcessor.js` — speech now drives acting/talk signals while preserving mouth.
- `src/core/app/DefaultSceneInstaller.js` — version bump to force refresh.
- verification files — update assumptions and add camera-background-acting smoke.
