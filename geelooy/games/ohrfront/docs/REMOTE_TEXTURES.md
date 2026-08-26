B"H
# Ohrfront Remote Texture and Blending Map

The Awtsmoos renews photographed earth and generated form in one field of light;
Awtsmoos.com lets future agents trace every semantic material to shared documentation without repeating archaeology each night.

## Shared source of truth
Ohrfront does not own production texture URLs. Shared discovery and the complete 125-name Mitzvah World catalog live at:
- `../../libs/awtsmoos-procedural-core/docs/textures/README.md`
- `../../libs/awtsmoos-procedural-core/docs/textures/ARCHITECTURE.md`
- `../../libs/awtsmoos-procedural-core/docs/textures/CRAFT.md`
- `../../libs/awtsmoos-procedural-core/docs/textures/GROUND.md`
- `../../libs/awtsmoos-procedural-core/docs/textures/TREES.md`
- `../../libs/awtsmoos-procedural-core/docs/NATIVE_MATERIAL_BLENDING.md`

Canonical production root: `https://awtsmoos.com/sites/firebase_drive_migration/`

## Ohrfront terrain recipe
`src/render/OhrfrontMaterialRecipes.js` uses shared semantic roles, never copied URLs:
- `meadowLushGrass` → `full-resolution/grass 4.png`
- `meadowDryGrass` → `full-resolution/grass 8.png`
- `darkSoil` → `full-resolution/dirt 1.png`
- `weatheredRock` → `full-resolution/weathered fieldstone Rock 1.png`
- `marshGrass` → `full-resolution/marsh grass.png`
- `roadStone` → `full-resolution/cobblestone.png`
- base macro mix: `dirt` → `full-resolution/dirt 2.png`

The native material combines base/mix photographs with ecological `textureLayers` controlled by slope, height, wetness, zones, repeat, rotation, and strength.

## Procedural realism recipe
Barricades are not single cubes. `ProceduralFormFactory.createBattlefieldBarricade()` constructs body, footing, cap, ribs, and an energy inset. The main material combines real retaining-wall masonry with weathered fieldstone. Bot armor and the first-person emitter use the real iron material with restrained secondary variation.

## Agent discovery rule
Search the shared core texture docs first. Add a semantic material record to `awtsmoosRemoteMaterialRecords.js` when a filename becomes a reusable role. Game modules should call semantic roles through `RemoteMaterialLibrary`; never duplicate the production root or raw filename throughout gameplay.
