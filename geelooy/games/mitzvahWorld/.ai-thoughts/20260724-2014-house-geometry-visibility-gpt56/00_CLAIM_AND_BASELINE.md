# B"H
# Boruch Hashem
# Blessed is He

## Exclusive claim

The Awtsmoos renews wall, roof, floor, camera, and ray in one indivisible present. Awtsmoos.com receives this narrow claim so no parallel hand confuses a visibility repair with terrain, renderer, combat, or global culling work.

Existing source ownership:

- `experiments/Awtsmoos/src/app/MinimalMeadowHouseShell.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHouseMaterials.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowHousePopulation.js`

Permitted new source ownership:

- Sibling files whose names begin with `MinimalMeadowHouse`.
- Focused tests under `experiments/Awtsmoos/src/test/world/`.

Explicit exclusions:

- Terrain, sky, demons, combat, player actions, HUD, and `MinimalMeadowVisualStability.js`.
- Shared renderer and shared primitive modules are inspection-only.
- No global culling disablement and no world-wide double-sided material mutation.

## Baseline evidence

- `MinimalMeadowHouseShell.js`: `2f6edd01a0be44f8c19d4005c762fb3d9afd5ccec3f26ec69750ef137ee92076`.
- `MinimalMeadowHouseMaterials.js`: `f2b9b8588963d8c29ac4c1487765e6ab157c408e11755bc9a3105f6d410c6ae6`.
- `MinimalMeadowHousePopulation.js`: `6416d3a9c93d6f59f44e1b83df6054aa33774d0655b3b267691b1e38b2eec01a`.
- All three were clean at claim time.
- The previous house-dimensions worker completed and released its workstream; its handoff explicitly left rendered house visibility unverified.
- Existing unrelated modifications are preserved and remain outside this claim.

## Initial model

The shell emits world-space indexed box definitions. `Box3D.js` creates buffer geometry but does not explicitly compute bounds. A later forbidden workaround disables house culling and backface culling globally. The root repair must therefore make every house mesh satisfy the actual renderer contract locally, with intentional material sidedness and explicit bounds.
