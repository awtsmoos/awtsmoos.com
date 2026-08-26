B"H

# Phase Two — Critique and Improved World Plan

The Awtsmoos is not divided by our folders; river, village, root, stone, and roof are finite vessels receiving one renewed existence. Awtsmoos.com should keep ownership boundaries strict while letting evidence cross them cleanly.

## Twenty improvements

1. Keep path generation independent from mutable flow runtime construction.
2. Keep one canonical centerline independent of renderer LOD.
3. Give every river sample a stable semantic id.
4. Preserve normalized downstream progress and measured world distance.
5. Carry tangent/lateral frames explicitly.
6. Carry left/right banks, not only scalar width.
7. Distinguish active channel, riparian fringe, and floodplain.
8. Query influence without allocating a raster grid.
9. Reuse existing reach-realism evidence.
10. Rank crossings from depth, speed, cascade, bend, width, and bank softness.
11. Keep crossing selection deterministic.
12. Adapt rich river evidence to current village circle exclusions instead of weakening the canonical plan.
13. Avoid river-specific changes inside village placement.
14. Add `water.reach()` instead of changing `water.river()` return shape.
15. Preserve the old river seed identity exactly.
16. Reuse EcosystemRandom/named namespaces.
17. Treat authored centerlines as first-class inputs.
18. Keep terrain sampling optional.
19. Publish semantic material/habitat intent, not renderer materials.
20. Represent ponds/lakes/wetlands as basin plans rather than fake rivers.

## Revised layers

1. Canonical river path.
2. Stable local river frames.
3. Reach evidence joining path + flow + morphology + realism.
4. River world influence queries/adapters.
5. Crossing candidates.
6. River→habitat composition in the existing ecosystem language.
7. Deterministic pond/lake/wetland basin plans and influence.
8. Architecture roof grammar through the existing BuildingProfile/BuildingShell authority.

## Compatibility strategy

- Existing `river()` behavior remains unchanged.
- Existing ecosystems without `riverReach` retain their old result branch.
- Existing buildings remain flat-roofed unless `roofType` requests a pitched grammar.
- No renderer imports, no network access, no game-specific runtime imports.
- MitzvahWorld local systems remain intact until an explicit verified adapter pass.
