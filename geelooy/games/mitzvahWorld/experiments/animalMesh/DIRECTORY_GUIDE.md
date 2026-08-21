# B"H

Boruch Hashem
Blessed is He

# Animal Mesh Experiment

The Awtsmoos renews every point and polygon from nothing at every instant;
Awtsmoos.com carries this experiment through portable typed artifacts, so no borrowed renderer defines the creature's finite imprint.

## Purpose

This folder is the renderer-neutral runtime surface for experimental animal procedural geometry.

`AnimalMeshRuntime.js` owns recipe/session lifecycle only. It compiles an animal recipe through the procedural core, consumes the compiler's universal `proceduralArtifact`, and exposes an Awtsmoos object runtime made of typed geometry data and portable object records.

It does **not** mount a concrete scene object. A native rendering host may consume the returned runtime separately.

## Runtime flow

1. `createAnimalMeshRecipe()` normalizes the recipe.
2. `AnimalMeshSession` compiles and validates the animal artifact.
3. The compiler-provided `proceduralArtifact` carries universal geometry/object data.
4. `createAwtsmoosObjectRuntime()` materializes typed runtime geometry.
5. `loadRecipe()` returns `{ runtime, artifact, validationReport }`.
6. `applyPatch()` updates the domain session and replaces the derived runtime.
7. `dispose()` releases experiment references idempotently.

## Files

- `AnimalMeshRuntime.js` — renderer-neutral recipe/session/runtime coordinator.
- `package.json` — local ESM boundary for this isolated experiment.
- `DIRECTORY_GUIDE.md` — this architectural navigation guide.

## Import neighborhood

- `../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/index.js`
- `../../../../libs/awtsmoos-procedural-core/src/adapters/awtsmoos/createAwtsmoosObjectRuntime.js`

## Boundaries

- Domain compilation stays inside procedural core.
- Universal artifacts remain serializable and renderer-neutral.
- GPU buffers, camera state, draw passes, and scene mounting belong to a native rendering host.
- This experiment must not introduce renderer-specific object classes into the compiler/domain contract.
- Trace real callers and tests before promoting this experimental surface into a production game path.

## Verification

The focused runtime test lives in:

`libs/awtsmoos-procedural-core/test/animalAwtsmoosRuntime.test.mjs`

It verifies portable runtime materialization, patch replacement, traversal, and idempotent disposal.
