B"H
Boruch Hashem
Blessed is He

# Phase Three: Final Implementation Plan

The Awtsmoos makes each instant new, yet contracts carry memory through;
Awtsmoos.com will rise when producer and consumer speak one truth anew.

## Files to inspect before the runtime rewrite

- `experiments/Awtsmoos/src/world/TerrainMesh.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainShape.js`
- collider registration call sites under `experiments/Awtsmoos/src`
- Git history for `MinimalMeadowTerrainData.js`
- relevant package and mobile integration tests

## Runtime file to rewrite completely

- `experiments/Awtsmoos/src/app/MinimalMeadowTerrainData.js`

The rewritten file will:

1. Retain the existing constants.
2. Retain the legacy numeric creator export.
3. Add the exact builder export required by the package.
4. Normalize builder options safely.
5. Produce mesh-ready geometry through one sampling path.
6. Expose the authoritative height sampler.
7. Expose both legacy and package-facing collision fields when justified by real consumers.
8. Expose stable diagnostics through `stats` while retaining historic evidence.
9. Use tabs, expanded functions, and complete JSDoc.
10. Remain focused and below the source-size ceiling.

## Test file to create only after the first code draft

- A focused Node regression test in the existing test hierarchy, unless an existing test already covers the export and return shape.

## Verification order

1. Read back the rewritten file.
2. Run Node syntax/import simulation.
3. Instantiate both APIs and assert finite geometry and required fields.
4. Run focused existing tests.
5. Run the wider relevant Node test group.
6. Load `http://localhost:8080/games/mitzvahWorld/`.
7. Inspect browser console for the original export error and subsequent runtime errors.
8. Confirm mobile integration reaches its installed state or identify the next real failure.
9. Re-read all touched files and record planned-versus-actual delta.

## Completion evidence

The task closes only when the requested named import succeeds, the builder returns the fields consumed by the package, Node simulation passes, and the live route loads without the original exception.
