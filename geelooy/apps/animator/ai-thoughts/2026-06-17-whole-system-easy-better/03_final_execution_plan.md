B"H

# Final Execution Plan

The better path is a real authoring system, not another visual-only patch.

## Files to create

- src/authoring/goalBoard/GoalBoardDefaults.js
- src/authoring/goalBoard/GoalBoardBeatCompiler.js
- src/authoring/goalBoard/GoalBoardScenePreset.js
- src/authoring/goalBoard/GoalBoardQualityGate.js
- src/authoring/goalBoard/GoalBoardPreviewManifest.js
- src/authoring/goalBoard/GoalBoardEasyAPI.js
- src/authoring/goalBoard/index.js
- tools/verify/goalBoardEasySystemSmoke.js

## Files to rewrite

- src/data/scenes/default/DefaultLivingScene.js
- package.json

## What this does

The engine gains a top-level one-call scene factory. The default scene stops manually importing the old scattered scene internals. Quality metrics and preview manifests become first-class. Future improvements can change the preset system rather than patch every scene by hand.
