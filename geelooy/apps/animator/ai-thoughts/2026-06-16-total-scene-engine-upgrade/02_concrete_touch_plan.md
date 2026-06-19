B"H

# Concrete Touch Plan

Files likely to rewrite/create after forensics:

- `src/core/renderer/Manager.js` or true app renderer if found.
- `src/core/renderer/scene/Manager.js` if it is actually called.
- `src/core/renderer/scene/ProductionStageRenderer.js` new full scene renderer.
- `src/core/renderer/scene/ProductionStageOverlay.js` if foreground props need a second pass.
- `src/core/app/DefaultSceneInstaller.js` to force scene version again.
- `src/data/scenes/healthyLunch/*` to improve coordinates and story.
- `src/nle/ui/NLEInteractionSeal.js` to reduce UI obstruction harder.
- `tools/verify/productionSceneSmoke.js` for render path imports and scene style.
- `package.json` to add verify script.

No partial patches. Every touched file is rewritten whole.
