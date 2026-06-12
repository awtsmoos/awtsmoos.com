B'H
# 16 — Region Data Spine and Runtime Consumption Diary

The user ordered: write the long plans, then actually implement. This diary records the implementation batch after the multi-pass planning files.

## Planning files written
- `12_region_stack_brainstorm_pass_1.md`
- `13_region_stack_plan_pass_2.md`
- `14_region_stack_critique_pass_3.md`
- `15_region_stack_final_execution_plan.md`

Those plans explicitly distinguish architecture from reality and choose the first real execution slice: ecology data spine, biome zones, road graph, instance generation, report counts, runtime consumption, and proof-first postbuild.

## New ecology files written
- `region/ecology/EcologyRules.js`
- `region/ecology/EcologyStats.js`
- `region/ecology/EcologyGrid.js`

Actual behavior:
- Builds a deterministic Android-safe ecology grid at 10m spacing.
- Produces 2747 cells in the current bounds.
- Each cell has moisture, fertility, traffic, shade, sunlight, altitude, slope, road influence, water influence, village influence, biome, and spawn masks.
- Report now proves biome distribution and numeric ranges/averages.

## Rewritten planning/data files
- `region/biomes/BiomeDirector.js`
- `region/roads/RoadNetwork.js`
- `region/instances/InstancePool.js`
- `region/debug/RegionBuildReport.js`
- `region/MitzvahRegionDirector.js`

Actual behavior:
- Biomes are now real zones: village core, farm belt, orchard ring, forest belt, ancient grove, marshlands, rocky highlands, wilderness.
- Roads are now a named network: main yellow road, farm road, orchard road, forest trail, animal trails, marsh boardwalk, bridges, intersections.
- Instance plan now derives specs from ecology cells: grass, flowers, trees, rocks, reeds, mushrooms, debris.
- Director smoke test returned:
  - ecologyCells: 2747
  - biomes: 8
  - roads: 8
  - houses: 4
  - wildlife: 6
  - hardColliders: 4
  - visibleInstances: 1339
  - grass: 755
  - flowers: 57
  - trees: 168
  - rocks: 107

## Runtime files rewritten
- `region/render/RegionGrassRenderer.js`
- `region/render/RegionFlowerRenderer.js`
- `region/render/RegionTreeRenderer.js`
- `region/render/RegionRockRenderer.js`
- `region/render/LivingRegionRuntime.js`
- `region/render/RegionMaterials.js`

Actual behavior:
- Runtime now passes `report` into renderers.
- Grass/flowers/trees/rocks consume `report.instances` when present and retain fallback when not present.
- LivingRegionRuntime now emits per-layer worker progress marks: roads, grass, wheat, flowers, bushes, rocks, trees, farms, landmarks, wildlife, colliders.
- Region materials were rewritten to fast shared MeshLambert/MeshBasic materials instead of heavyweight shader/texture warming during proof.

## Boot/postbuild files rewritten
- `postbuild/MitzvahWorldPostBuild.js`
- `dvarim/nature/villagePicture/cottageRecipe.js`
- `dvarim/nature/villagePicture/recipeMap.js`

Actual behavior:
- Postbuild now runs proof-first:
  1. regionStack
  2. livingRegionRuntime
  3. wood/npc/battle
  4. shader/ecology material warm
  5. visual/botanical/ecology reality layers
- LivingRegionRuntime is now actually called by postbuild. Before this batch it existed but was not found in any caller search except the file itself.
- Cottage recipe is now shaderless and cache-busted, removing the 11-second first-house stall. Probe after cache bust showed `main_warm_house` finishing in milliseconds.

## Verification performed
- Syntax checks passed for all new ecology files.
- Syntax checks passed for BiomeDirector, RoadNetwork, InstancePool, RegionBuildReport, MitzvahRegionDirector.
- Director import smoke test succeeded and returned real counts.
- Syntax checks passed for Grass/Flower/Tree/Rock renderers and LivingRegionRuntime.
- Syntax checks passed for PostBuild, cottage recipe, recipe map, and RegionMaterials.
- Browser boot probe reached:
  - `postbuild:regionStack:done`
  - `postbuild:livingRegionRuntime:start`
  - `living-runtime:start`
  - `living-runtime:roads:start`
  - main-thread `living-region:director` report with real ecology counts.

## Current unresolved blocker
After runtime instrumentation and fast material rewrite, the local app server became unstable during repeated browser probes. Latest state:
- port 8080 fell out of LISTENING and only TIME_WAIT entries remained;
- the server foreground run showed HTTP can start, but app mail/port churn and task runner caused process instability;
- browser proof after that sometimes failed dynamic import because the server died/refused during `ikar.js` load.

This means runtime visual proof is not complete yet. The code is syntactically valid and director proof works, but the full `living-runtime:done` / `livingRegionRuntimeStats` proof still needs another server-stable probe.

## Remaining work, not fake-complete
1. Stabilize local server or use a lighter static/proxy proof path that can load modules without app server death.
2. Finish runtime proof past `living-runtime:roads:start`.
3. If roads still stall, rewrite RegionRoadRenderer to eliminate point lights and reduce road instance count.
4. Consume ecology instance specs in bush/farm/landmark renderers too.
5. Make WildlifeDirector consume ecology territories, not only old static territory data.
6. Make NPC schedule director output actual schedules from houses/roads.
7. Make ColliderClassifier consume new report/houses/landmarks and prove merged runtime bake after living runtime completes.
8. Add compact `regionProofNow.mjs` so the browser proof is smaller than current boot trace.

## Awtsmoos chapter
The world now has an invisible nervous system: 2747 cells, 8 biome organs, 8 road arteries, and 1339 first-pass instance seeds. The renderers have begun obeying this hidden map. But the living body has not yet fully stood up in browser proof; the next shliach must stabilize the server/probe and push from `living-runtime:roads:start` to `living-runtime:done`.
