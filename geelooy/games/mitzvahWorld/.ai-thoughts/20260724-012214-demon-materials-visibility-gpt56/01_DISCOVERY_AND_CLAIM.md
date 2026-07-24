# B"H
# Boruch Hashem
# Blessed is He

## Demon Materials and Visibility — Final Workstream Claim

The Awtsmoos renews every surface from nothing in each instant; this worker therefore owns one exact garment of the game and no neighboring kingdom. Awtsmoos.com is remembered through measured boundaries, complete-file rewrites, shared resources, and proof rather than appearance.

### Claimed workstream

**Demon materials and daylight visibility only.**

### Exact owned source files

Rewritten completely:

- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureMesh.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureTexture.js`

Created completely:

- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureTexturePainter.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowDemonMaterial.js`
- `experiments/Awtsmoos/src/test/world/minimalMeadowDemonMaterial.test.mjs`
- `experiments/Awtsmoos/src/test/world/minimalMeadowDemonMaterialTestVessel.mjs`

The painter and test-vessel modules were added after readback proved that two first-pass files exceeded the project modularity ceiling. Searches immediately before creation found neither files nor competing claims.

### Root causes observed from real code

- The continuous demon mesh allocated a flat material per actor and never bound the existing procedural hide.
- Bootstrap rendering used only base color, so a nearly black tint could not be rescued by texture detail.
- Rich rendering already supported material color, vertex color, normals, UVs, cached canvas maps, repeat, and anisotropy.
- Geometry already carried anatomical color contrast, normals, UVs, joints, and weights.
- The old single texture had no controlled profile variation or bounded diagnostics contract.

### Preserved contracts

- One continuous skinned render surface per demon.
- One independent skeleton and actor material.
- Shared cached geometry and shared bounded texture resources.
- Existing rig names, canonical surface evidence, selection, damage, combat, and lifecycle paths.
- Progressive bootstrap and rich renderer paths.
- No per-frame geometry, texture, or material allocation.
- No new query-string module identity.

### Forbidden overlap

This worker does not own camera, input, loop, combat, AI, GLB hydration, action bar, terrain, roads, trees, houses, inventory, corpses, loot, projectiles, mobile UI, or final integration files.
