B"H

# Wave B — Tiferes: Final Material Lineage Implementation Map

The Awtsmoos renews local matter, remote provenance, generated intent, and layered recipe as one created reality while every finite identity remains distinct; Awtsmoos.com lets Tiferes join them into a professional inspection language that is transparent enough to debug, immutable enough to trust, and quiet enough never to execute hidden work.

## Final source architecture

New modules:

1. `src/core/materials/MaterialStableIdentity.js`
   - recursively canonicalizes JSON-like material data by sorted object keys;
   - rejects functions, symbols, undefined-in-arrays, exotic prototypes, and non-finite numbers;
   - returns transparent namespaced stable identities.

2. `src/core/natureApi/SurfaceGenerationRequest.js`
   - creates the one canonical generation request from a resolved local Nature result + options;
   - reused by real async generation and inspection.

3. `src/core/natureApi/MaterialNatureIdentity.js`
   - creates aggregate material identity from existing fallback key, remote variant/request key, generated cache key, role, family, and source order;
   - exposes recipe identity for logical stack/mix authoring only.

4. `src/core/natureApi/MaterialNatureLineage.js`
   - creates a deeply frozen lineage view over local, remote, generated, pairing, and provider evidence;
   - preserves existing provenance records rather than translating them into a rival vocabulary.

5. `src/core/natureApi/MaterialNatureInspectionApi.js`
   - extends `MaterialNatureCompositionApi`;
   - methods: `lineage`, `identity`, `generationRequest`, `generationKey`, `generationProvider`, `recipeIdentity`, `describeMaterial`.

6. Capability family split:
   - `NatureCapabilitySurfaceCore.js` — material + generated texture root doors.
   - `NatureCapabilitySurfaceComposition.js` — channel/blend/layer/stack/mix.
   - `NatureCapabilitySurfaceInspection.js` — lineage/identity/request/key/provider/recipeIdentity/describeMaterial.
   - `NatureCapabilitySurface.js` becomes aggregator only.

Whole-file rewrites after current full reads:

- `SurfaceNatureApi.js` — replace duplicated generation-request construction with `createNatureSurfaceGenerationRequest`.
- `MaterialNatureApi.js` — extend `MaterialNatureInspectionApi` while preserving `generateTexture` and `canGenerateTextures` exactly.
- `natureApi/index.js` — export stable material identity helpers only if expert callers benefit; keep under 120 lines.

## Exact behavior contracts

### Local plan lineage

`materials.lineage('bark')` returns:

- canonical role/family;
- aggregate transparent identity;
- local source always available with exact fallback key;
- remote source intent with exact existing provenance/variant/request identity when registered;
- generated source only marked enabled when surface options enabled it;
- actual provider availability reported separately;
- pairing primary/resolution order preserved.

### Generation inspection

`materials.generationRequest('bark', options)` returns the exact same normalized request actual `generateTexture()` would send, but performs no provider call.

`materials.generationKey(...)` returns that request's existing cache key.

### Provider evidence

`materials.generationProvider()` returns `{ available, name }`, never the provider function/object.

### Recipe identity

`materials.recipeIdentity(materials.stack(...))` ignores runtime page/capacity state and derives identity from logical recipe name/shader/fallback/layers/target intent.

## Third-pass critique

1. Do not make aggregate identity the cache key for any existing subsystem.
2. Do not rewrite legacy remote request-key semantics.
3. Do not rewrite generated texture cache-key semantics.
4. Do not include mutable browser images in lineage.
5. Do not include provider objects in lineage.
6. Do not include AbortSignal in identity.
7. Do not include strict failure mode in material identity; it is execution policy, not material identity.
8. Do not include current cache statistics in material identity.
9. Do not infer remote success from remote availability; intent and resolved runtime provenance are different truths.
10. Do not claim generated assets exist before a provider result exists.
11. Keep surface result compatibility exact.
12. Preserve secure HTTPS validation.
13. Preserve local-only procedural roles.
14. Canonical identity must be deterministic across equivalent object key order.
15. Canonical identity must retain array order because material stack layer order is meaningful after canonical recipe ordering.
16. Preserve class-based material stack authority.
17. Avoid forcing generation intent merely because caller asks for lineage.
18. Generation-request inspection is explicitly a what-would-be-sent operation and may construct a request regardless of plan generation enablement.
19. New capability inspection methods remain nested, never root Nature methods.
20. No tests until every source file above is written and fully reread.

## Verification gate

- all new/rewritten source <=120 lines;
- syntax/import graph green;
- generationRequest equals request inside actual generated result for same call;
- inspection never increments provider call count;
- aggregate identity deterministic across repeated/equivalent options;
- remote/fallback/generation keys preserved verbatim;
- recipe identity stable across repeated equivalent stack construction;
- provider report hides provider object;
- old material tests + capability runtime-path tests remain green;
- capability `byPath()` resolves every new inspection route.
