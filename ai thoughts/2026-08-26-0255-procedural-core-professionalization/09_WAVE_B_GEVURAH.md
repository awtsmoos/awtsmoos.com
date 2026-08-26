B"H

# Wave B — Gevurah: Material Lineage Boundaries

The Awtsmoos renews source and identity together while Gevurah refuses their confusion; Awtsmoos.com lets every local, remote, generated, and composed garment retain its own law so professional inspection never becomes hidden execution in disguise.

## Twenty implementation boundaries

1. Lineage is descriptive only; it performs no I/O.
2. Local fallback remains mandatory and primary truth beneath optional sources.
3. Preserve the exact existing local `fallbackKey` instead of recalculating it differently.
4. Preserve the exact existing remote `variantKey` and `requestKey` when remote intent exists.
5. Preserve the exact existing generated request `cacheKey`.
6. Aggregate identity may reference those identities but must never replace them.
7. Stable aggregate identity must canonicalize object keys recursively rather than depend on caller insertion order.
8. Identity code rejects non-finite numbers and executable values instead of silently stringifying them.
9. Provider reports expose availability and stable provider name only, never provider functions/objects.
10. Generation request inspection must use the same request-construction authority as actual async generation.
11. Refactor `SurfaceNatureApi.generate()` to delegate request construction to that shared authority.
12. Refactoring must preserve generated result shape and fallback behavior exactly.
13. `generationRequest()` never invokes the gateway.
14. `generationKey()` is derived from the inspected request and never calls a provider.
15. `lineage()` describes only sources actually represented by the surface plan; generated possibility remains distinct from provider availability.
16. `recipeIdentity()` accepts material stack/mix recipes and produces transparent deterministic identity without renderer capacity.
17. Composition identity does not include transient GPU paging state.
18. Add new API through `MaterialNatureInspectionApi extends MaterialNatureCompositionApi`; keep `MaterialNatureApi` as the generated-texture convenience crown.
19. Capability metadata for inspection methods lives in its own surface-inspection family so the existing surface family does not exceed 120 lines.
20. Tests occur only after the entire Wave B source slice is written and reread.

## Risk reconstruction

- If identity uses raw JSON stringification, equivalent authoring objects with reordered keys can diverge. Canonicalize first.
- If lineage copies provider objects, serialization/security boundaries fail. Expose name/boolean only.
- If inspection constructs generation requests independently, cache keys can drift from actual generation. Share one helper.
- If generation is automatically enabled during `lineage()`, a descriptive call changes semantic intent. Do not force it.
- If a stack identity includes page/capacity diagnostics, identity changes with renderer limits. Use logical recipe only.
- If capability metadata is added to the current 107-line Surface family, architecture immediately loses headroom. Split families.
