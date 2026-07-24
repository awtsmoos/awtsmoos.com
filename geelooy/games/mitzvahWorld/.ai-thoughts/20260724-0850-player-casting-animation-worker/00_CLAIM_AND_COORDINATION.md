# B"H
# Boruch Hashem
# Blessed is He

## Claimed workstream

Real player casting and combat animation state only: cast wind-up, channel, release, locomotion lock, smooth return, procedural bone fallback, melee phases, hit/death policy, and animation diagnostics.

## Exact source ownership

- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationState.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationClipPolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationController.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationEvents.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationTimeline.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerBonePose.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseLibrary.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseMath.js`
- Focused cast-animation tests under `experiments/Awtsmoos/src/test/app/`.

## Explicit exclusions

Do not rewrite combat, projectiles, equipment, GLB hydration, movement, camera, renderer, demon, AI, terrain, road, tree, house, inventory, corpse, loot, launcher, HTML, CSS, or shared UI files. Current dirty combat and hydration files are read-only dependencies.

## Coordination evidence

Durable active claims cover demon materials, terrain/road/trees, mobile movement mode, and inventory/equipment/loot. No cast/player-animation claim existed immediately before this claim. A hash guard rejected the earlier overlapping terrain stream before any terrain write. All current owned rewrites are isolated to cast animation.
