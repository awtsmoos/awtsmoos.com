# B"H
# Boruch Hashem
# Blessed is He

## House geometry and visibility handoff

The Awtsmoos renews every wall and every gaze in one present; Awtsmoos.com receives a house whose draw contract is now owned where the house is constructed.

## Exact root cause

The disappearing-house defect was not caused by malformed box indices, reversed normals, negative scale, or a house visibility lifecycle toggle. The box primitive has correct outward winding, and all house transforms are identity-positive.

The root cause was that house construction did not establish a durable renderer contract. All 123 inspected static house meshes were created without explicit bounding boxes, explicit bounding spheres, retained authored definitions, or explicit architectural side policy. The implementation instead depended on lazy renderer sphere creation and a later blanket mutation in `MinimalMeadowVisualStability.js`. That workaround attempted to disable culling through a flag the custom draw-list does not consult and made all house materials double-sided after construction. Dynamic door panels rebuilt after that one-time mutation could fall outside the workaround entirely.

The repair makes house construction authoritative: every house mesh receives explicit calculated bounds, renderer-native cached bounds, retained definition evidence, intentional front-side policy for correctly wound closed solids, active frustum culling, and verified identity world transforms. The population reapplies this local contract after mounting and after dynamic door rebuilding.

## Production files changed

Existing complete rewrites:

- `experiments/Awtsmoos/src/app/MinimalMeadowHouseShell.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseMaterials.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHousePopulation.js`

New house sibling modules:

- `experiments/Awtsmoos/src/app/MinimalMeadowHouseGeometryBounds.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseGeometryContract.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseSurfacePolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHousePopulationDefinitions.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHousePopulationDiagnostics.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHousePopulationQueries.js`

## Focused tests added

- `experiments/Awtsmoos/src/test/world/MinimalMeadowHouseTestFixture.mjs`
- `experiments/Awtsmoos/src/test/world/minimalMeadowHouseGeometryContract.test.mjs`
- `experiments/Awtsmoos/src/test/world/minimalMeadowHouseOrbitVisibility.test.mjs`
- `experiments/Awtsmoos/src/test/world/minimalMeadowHouseCollisionDepth.test.mjs`
- `experiments/Awtsmoos/src/test/world/minimalMeadowHousePopulationCompatibility.test.mjs`

## Verification receipt

- Final combined run: 19 tests passed, 0 failed.
- House orbit: 32 angles x 4 elevations x 2 houses, with culling active.
- Traversal: exterior approach, threshold, interior center, rear exit, and beneath-house views.
- Winding failures: 0.
- Invalid or non-identity house matrices: 0.
- Missing explicit boxes or spheres after repair: 0.
- Visible/collision bounds mismatches: 0.
- Exposed terrain/foundation/floor overlap failures: 0.
- Syntax checks: all 14 touched executable files passed.
- Tab indentation checks: all 14 touched executable files passed.
- Every touched executable file is 102 lines or fewer.
- `git diff --check`: passed.
- `MinimalMeadowVisualStability.js`: unchanged.
- Existing house regressions: 6 passed, 0 failed.
- No commit created.

Full readback, test output, hashes, and verification logs are retained in this handoff folder.
