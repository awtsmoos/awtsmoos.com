# B"H
# Boruch Hashem
# Blessed is He

## Second Plan — Gevurah Boundaries

### Exact files owned

Rewrite completely:

- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureTexture.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureMesh.js`

Create completely:

- `experiments/Awtsmoos/src/app/MinimalMeadowDemonMaterial.js`
- `experiments/Awtsmoos/src/test/world/minimalMeadowDemonMaterial.test.mjs`

### Files deliberately not touched

- Renderers.
- Geometry generation.
- Enemy actor lifecycle.
- Selection, damage, combat, movement, camera, UI, terrain, trees, houses, inventory, and integration files.

### Runtime graph

`MinimalMeadowEnemyActor -> createMinimalMeadowProceduralCreature -> createMinimalMeadowCreatureMesh -> createMinimalMeadowDemonMaterial -> getMinimalMeadowCreatureTexture`

The material factory receives `THREE` and `profile`. It resolves a finite visual family, obtains a cached procedural canvas, normalizes the profile tint into a readable dark range, and creates one `MeshStandardMaterial`. The mesh binds it once and preserves the current skeleton and evidence contracts.

### Verification graph

- Syntax for every touched JavaScript file.
- Import resolution from the owned graph.
- Unit behavior for cache sharing and material isolation.
- Geometry attribute preservation.
- Tab indentation.
- No query-string imports in the owned graph.
- No artifact paths under Git.
- Final source hashes and scoped diff.
- One complete desktop and mobile game run after coding, without reopening after each small edit.
