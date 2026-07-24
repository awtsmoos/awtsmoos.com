# B"H
# Live Mobile Visual Rescue Claim

## User-observed failures
- Feature publication crashes on undefined `now`.
- Mobile right rail starts collapsed and appears absent.
- Quest mount replaces canonical friendly GLB actors with a block primitive.
- Terrain and road UV density is not physically encoded in geometry.
- Road surface lacks sufficiently mixed source content and stable elevation.
- House surfaces may be culled or backface-hidden.
- Demon bootstrap rendering multiplies dark vertex color despite material opt-out.
- Procedural weapons are absent from bootstrap rendering.
- Custom action quaternion offsets may accumulate on bones not sampled by the imported clip.

## Claimed files
- `experiments/Awtsmoos/src/app/MinimalMeadowFeatureReceipts.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowGameRail.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowQuestNpcPopulation.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowRichWorldMounts.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainPackage.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainComposites.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowRoadRibbon.js`
- `experiments/Awtsmoos/src/world/TerrainMesh.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowWeaponFactory.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionActor.js`
- `experiments/Awtsmoos/src/app/BootstrapColorRenderer.js`
- new visual-density, quest-GLB, stability, and focused test modules.

Existing imported GLB clips, collision geometry, inventory authority, combat authority, house dimensions, and enemy AI remain authoritative.
