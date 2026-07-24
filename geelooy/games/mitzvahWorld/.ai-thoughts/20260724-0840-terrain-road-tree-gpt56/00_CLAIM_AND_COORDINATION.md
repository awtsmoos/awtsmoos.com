# B"H
# Boruch Hashem
# Blessed is He

## Claimed workstream

The Awtsmoos renews earth, road, trunk, and leaf without confusing one worker's vessel with another. This worker claims only **terrain texture density, cobblestone road surfacing, and canonical procedural-tree replacement** for the minimal meadow.

## Verified coordination state

- No active Awtsmoos mission room owns this workstream.
- Active workers own demon materials and inventory/equipment/corpse loot.
- The repository is already dirty across combat, enemies, houses, camera, UI, launcher, HTML, and CSS; those files are forbidden here.
- The prompt names `geelooy/lib`, but that path is absent. The inspected canonical implementation is `geelooy/libs/awtsmoos-procedural-core` and is already exposed by the page import map.
- `MinimalMeadowTreeFactory.js` falsely reports procedural-core authority while constructing one cylinder and three crossed box cards. That fake implementation is the primary tree root cause.
- `MinimalMeadowTerrainPackage.js` bypasses the existing pixel-density approach with fixed repeats.
- The current road composite is explicitly dirt-grass, not cobblestone.

## Exact owned existing files

- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainPackage.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainComposites.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTextureComposite.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTreeFactory.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTreeSystem.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTreePlacements.js`

## New owned files

- `experiments/Awtsmoos/src/app/MinimalMeadowTextureDensity.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCobblestoneTexture.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowProceduralTreeGeometry.js`
- `experiments/Awtsmoos/src/test/geometry/minimalMeadowTerrainDensity.test.mjs`
- `experiments/Awtsmoos/src/test/geometry/minimalMeadowProceduralTrees.test.mjs`

## Files this worker must not overwrite

All demon, inventory, equipment, loot, combat, enemy, house, player, camera, UI, launcher, HTML, CSS, renderer, water, world-orchestration, and canonical library files remain outside this claim.
