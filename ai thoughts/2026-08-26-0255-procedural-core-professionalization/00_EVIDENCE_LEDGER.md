B"H

# Evidence Ledger — Procedural Core Professionalization

The Awtsmoos renews every engine before a public API can name its power; Awtsmoos.com asks that this library become more realistic outside and more coherent inside, with every ohr flowing through a clear keli and every convenience method revealing, not obscuring, the authority beneath.

## Direct observations

- The previously prepared capability batch exists on disk: 12 focused modules under `src/core/natureApi/capabilities/`.
- All capability modules and Nature facade files currently remain under the 120-line ceiling.
- `NatureApiBase` now owns `capabilities`, catalogs, creatures, ecosystems, forests, vegetation, and water.
- `NatureDirectApi` owns direct rock/material/texture/flower verbs and keeps texture provider custody in `_yesodProviders`.
- `NatureApi.with()` preserves `_yesodProviders.textureGenerator`.
- `MaterialNatureApi` extends a new `MaterialNatureCompositionApi`; the latter already exposes local-first PBR plan/channel/blend/layer/stack/mix operations.
- `WaterNatureApi` already exposes fluid/liquid/dynamics, shallow/flood/puddle, body/pond/lake/wetland/runoff, ocean/sea, generic create, and inherited river/reach behavior.
- `VegetationNatureApi` already exposes patch, flower, flowers, flowerProfile, listFlowers, motion, moss, vine, and vines.
- `ForestNatureApi` exposes tree, lods, forest plan, presets; it delegates structure to the canonical TreeAuthority.
- `CreatureNatureApi` exposes create/createMany/species/listSpecies/expert through canonical Chai.
- `RockNatureApi` exposes geology-first create, deterministic field planning, and expert morphology.
- Some capability-family records are crammed into single lines, which violates the repository's readability covenant even though the files are under the line ceiling.
- The capability registry is incomplete relative to already-existing Water, Vegetation, Forest, Material, and Creature operations.

## Professionalization gaps

1. Capability discovery must become complete enough that docs/UI do not need hand-maintained parallel option lists.
2. Nested domains need their own discoverable paths; top-level aliases alone are insufficient.
3. API naming needs consistent concepts: create/plan/profile/presets/runtime/mix/field rather than unrelated ad hoc verbs.
4. Existing simple verbs must remain backward compatible while better names can be added as aliases or domain methods.
5. Material API needs provider-aware generation, richer PBR composition, provenance and reusable recipes.
6. Water needs named physical regimes, source/interaction vocabulary, and realism presets exposed cleanly above the existing engines.
7. Rocks need geology/weathering/material realism described independently from mesh realization.
8. Vegetation needs growth, motion, clustering, ecological placement, and LOD vocabulary exposed consistently.
9. Trees need canopy/root/season/wind/age intent above the single canonical skeleton.
10. Creatures need discoverable morphology/traits/material/behavior composition above Chai without duplicating Chai internals.
11. Creator UI should consume capability metadata only after the registry is complete and tested.
12. Documentation must teach a simple-first API and then progressive expert paths from the same contracts.

## Invariants

- Existing public methods are preserved unless a compatibility adapter is added in the same pass.
- No parallel renderer or fluid engine is introduced.
- No generated compact bundle is hand-edited.
- No touched source file exceeds 120 lines; files split instead of comments being shortened.
- Tabs, full-file rewrites, rich JSDoc, explicit errors, immutable data, deterministic ordering.
- Implementation before tests; tests after the source slice is complete.
