B"H

# Implementation Plan

## Files to rewrite

1. `experiments/Awtsmoos/src/app/MinimalMeadowEnemyNavigation.js`
	- Import the existing actor locomotion helper.
	- Replace the deleted `actor.move(...)` call with direct helper delegation.
	- Preserve collision-aware alternate steering and action state.

2. `experiments/light-three-gltf/tiny-render-culling.js`
	- Honor `mesh.frustumCulled === false` before custom distance/frustum sphere rejection.
	- Preserve all existing metadata and distance policy for ordinary meshes.

3. `experiments/Awtsmoos/src/app/MinimalMeadowTerrainDensityLayers.js`
	- Increase ecological contrast and source strength.
	- Preserve six bounded layers and mobile-safe sampler counts.

4. `experiments/Awtsmoos/src/app/MinimalMeadowTerrainMaterialDensity.js`
	- Raise mobile and desktop texel density.
	- Increase road and patch clarity without changing source images.

5. `experiments/Awtsmoos/src/world/TerrainMesh.js`
	- Improve zone weights so dry grass, wet meadow, soil, rock, village, and road produce visibly distinct blends.

6. `experiments/Awtsmoos/src/app/MinimalMeadowTerrainPackage.js`
	- Add the Bézier road ribbon to the group.
	- Make the road visible while retaining terrain as collision authority.
	- Keep the road mesh non-colliding and slightly elevated by its existing geometry contract.

## New focused contracts

After production code is finished, add direct tests for:

- combat locomotion no longer requiring `actor.move`
- renderer respecting `frustumCulled = false`
- terrain density above the old low-detail profile
- distinct ecological layer strengths
- visible road ribbon mounted in the package

No test command will run until all production and test code is written.
