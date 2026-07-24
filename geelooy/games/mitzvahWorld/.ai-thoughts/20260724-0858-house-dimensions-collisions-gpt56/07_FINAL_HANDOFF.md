# B"H
# Boruch Hashem
# Blessed is He

## Claimed workstream

Minimal-meadow house dimensions, foundations, floor plans, stairs, and collider alignment.

## Exact files rewritten or created

- `experiments/Awtsmoos/src/app/MinimalMeadowHouseDimensionPolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseProfiles.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseFoundation.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseFloorPlan.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseRooms.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseShell.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseStairs.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseAssemblyInstallers.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseAssembly.js`
- `experiments/Awtsmoos/src/test/app/minimalMeadowHouseDimensions.test.mjs`
- `experiments/Awtsmoos/src/test/app/minimalMeadowHouseTraversal.test.mjs`
- `experiments/Awtsmoos/src/test/app/minimalMeadowHouseEnvironment.test.mjs`

## Root causes found

- Legacy profiles remained 18×16 and 13×11 without measurable fortyfold expansion.
- Parent scaling would have enlarged doors, mezuzahs, handles, and collision.
- Large footprints required terrain-wide foundation sampling rather than center-height placement.
- The old single partitions and fixed stair run could not form traversable expanded interiors.
- The first enlarged placement covered spawn and road; measured second-pass relocation and aspect-ratio refinement were required.

## Final measured geometry

- Beis Ohr: 128×92, 40.889× legacy footprint, position (46, -60), two stories.
- Brick Cottage: 60×96, 40.280× legacy footprint, position (-80, -62), one story.
- Doors remain 2.1×3.1.
- Parent groups remain identity scale by source contract.
- Horizontal world corridor: 32 units.
- Dense footprint and approach samples avoid road, river, lake, and spawn.

## Contracts preserved

Existing door, mezuzah, material, population, pointer, octree, terrain, renderer, and rich-world lifecycle modules were not rewritten. Visible primitives and octree colliders still derive from the same definitions.

## Static checks and measured results

- All twelve touched JavaScript/MJS files passed `node --check`.
- All touched files use tab-leading indentation and remain at or below 120 lines.
- Six focused dimension, traversal, foundation, and environment tests passed.
- Local imports resolve with no duplicate query-string identities.
- Generated evidence remains outside Git.

## Browser verification boundary

Chrome status and `http://127.0.0.1:9225/json/list` proved the game page loaded at the house acceptance URL. The active split agent reports `browserControl: false`; native evaluation and screenshot actions were unavailable. A bounded direct-CDP acceptance stalled before producing its first page-inspection result and was cancelled. Desktop/mobile visual behavior must be rechecked by the integration worker on a browser-capable tunnel. No console-error, screenshot, rendered-object, or viewport claim is made here.

## External evidence

- `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/house-dimensions-gpt56-20260724/final-hashes.txt`
- `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/house-dimensions-gpt56-20260724/focused-tests-final.tap`
- `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/house-dimensions-gpt56-20260724/git-status-final.txt`
