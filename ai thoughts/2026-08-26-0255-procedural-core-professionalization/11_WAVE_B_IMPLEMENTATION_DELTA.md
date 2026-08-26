B"H

# Wave B Implementation Delta — Material Lineage After Hostile Readback

The Awtsmoos renews source, request, identity, and inspection until each finite vessel can bear its own light; Awtsmoos.com lets the hostile reread expose one last architectural crowding before tests can canonize a merely passing shape as right.

## Planned vs actual

Planned:
- one canonical generated-texture request authority shared by inspection and execution;
- transparent stable material identity;
- local/remote/generated lineage with provider evidence and no I/O;
- logical material recipe identity;
- inspection facade beneath the existing convenience crown;
- split surface capability metadata;
- preserve all existing generation/fallback behavior.

Actual:
- `MaterialStableIdentity` canonicalizes sorted plain-object keys while preserving array order and rejecting unsafe/exotic identity values;
- `SurfaceGenerationRequest` is now shared by real `SurfaceNatureApi.generate()` and inspection;
- `MaterialNatureIdentity`, `MaterialNatureLineage`, and `MaterialNatureInspectionApi` are implemented;
- `MaterialNatureApi` now extends inspection while retaining `generateTexture()` and `canGenerateTextures()`;
- Surface capability metadata is split into Core, Composition, Identity, and GenerationInspection families;
- the aggregate Surface capability file is now only an ordered aggregator;
- no provider/network work occurs during inspection.

## Readback evidence

- Every Wave B file is <=120 lines.
- Syntax passes for every new/rewritten file.
- `git diff --check` produces no error.
- Repeated material identity is stable.
- `generationRequest().cacheKey === generationKey()` for equivalent options.
- A counting provider remains at zero calls through identity, lineage, request, key, provider inspection, and recipe identity.
- Real stack recipes successfully produce stable recipe identity.
- `materials.lineage` resolves through capability discovery to `surface.lineage`.
- `materials.generationRequest` resolves to `surface.generation-request`.

## Delta D1 — Nature barrel has insufficient headroom

`src/core/natureApi/index.js` is now 115 lines. This is below the absolute 120-line ceiling but violates the professional headroom principle already applied to the capability facade. Future water/material/rock/tree/creature exports would immediately recreate pressure.

Resolution before tests:
- create `exports/NatureFacadeExports.js` for public Nature/facade classes;
- create `exports/NatureCapabilityExports.js` for discovery helpers;
- create `exports/NatureSpecialistExports.js` for water/material/ecology/specialist contracts;
- create `exports/NatureOrchestrationExports.js` for recipes/operation registry/profile/seed/result contracts;
- rewrite `natureApi/index.js` as a tiny stable re-export composition root.

No public symbol is removed or renamed. The split changes organization only.

## Test obligations after D1

1. stable identity ignores object-key insertion order but preserves array order;
2. invalid identity values fail explicitly;
3. lineage/identity/request/key/describe methods perform no provider calls;
4. actual generation request exactly equals inspected generation request;
5. local fallback key, remote variant/request key, and generated cache key remain verbatim;
6. provider report exposes only safe name/availability evidence;
7. equivalent stack/mix recipes receive stable recipe identity;
8. all new capability paths resolve to actual methods;
9. old material/generation/remote/stack/capability regressions remain green;
10. export surface remains behaviorally complete after barrel split.
