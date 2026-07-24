B"H
Boruch Hashem
Blessed is He

# Phase Two — Focused Architecture

The Awtsmoos renews one clear vessel before ornaments multiply; therefore the repair shall preserve legacy systems but remove them from the critical path.

## Current evidence

- The HTML entry alone carries a revision, but every reachable import also carries the same query string.
- Default boot chooses multiplayer and imports its bootstrap eagerly.
- Runtime startup awaits terrain texture batches and the complete world-system installer.
- Readiness awaits renderer hydration and canonical-player work, then runs a strict world receipt.
- Terrain blocks on eight Firebase grass sources plus an environment-v2 path source.
- Enemy population constructs six actors synchronously.
- Targeting owns a capture-phase pointerdown and stops propagation when a target is found.

## Realistic repair boundary

Rewrite only the launcher/runtime modules required to:

1. Create scene, camera, renderer, simple terrain, daylight, fallback player, input, one demon, HUD.
2. Start the loop and publish playable state immediately.
3. Defer multiplayer, player hydration, rich terrain, remaining demons, water, trees, houses, quests, and optional UI through one controlled queue.
4. Keep stable imports without per-module query strings.
5. Preserve the existing public diagnostics shape where practical.

## Files likely to change

- index.html
- launcher/MinimalSharedMeadowPage.js
- launcher/MinimalMeadowReadiness.js
- app/createMinimalMeadowRuntime.js
- app/MinimalMeadowLoop.js
- app/MinimalMeadowTerrainPackage.js
- app/MinimalMeadowEnemyPopulation.js
- app/MinimalMeadowEnemyActor.js only if evidence requires it
- ui/WorldTargetCoordinator.js only if hit testing proves capture blocks drag
- styles/mitzvah-world-corrections.css
- one small deferred-queue module if no existing equivalent is suitable

## Verification after complete first pass

- Desktop and mobile browser runs.
- Measured request count and duplicate canonical URLs.
- Console and failed-request audit.
- Canvas hit testing and pointer-event ownership.
- Demon visibility, scene parent, geometry count, selection, camera drag.
- Bag, keyboard, and joystick interactions.
- Chrome/debug-port cleanup.
