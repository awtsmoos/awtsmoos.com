B'H
# 13 — Region Stack Plan Pass 2: Concrete File Graph and Touch List

This pass turns the brainstorm into a file graph. The rule is that every file touched must either create a measurable data object, consume one, or improve proof. No placeholder systems. No dead architecture. No symbolic kingdoms.

## File graph: current reality

`MitzvahWorldPostBuild.js` is the worker-side gate. It currently runs shader warm, ecology material warm, region stack, collectibles, NPC roles, battle layer, visual reality, botanical reality, ecology reality. That means the region director can be blocked by visual warming or heavy early boot work. The postbuild order should eventually be proof-first: director, runtime, colliders, diagnostics, and only then optional warmth.

`MitzvahRegionDirector.js` is the plan compiler. It already imports the right modules, but its report is shallow. It should become the source of truth for cells, zones, roads, houses, instances, wildlife, NPC schedules, colliders, and summary counts.

`LivingRegionRuntime.js` is the visual assembler. It currently calls renderers mostly without passing detailed plans. It must become a consumer of the report, not a second independent planner.

The tiny biome files currently return symbolic summaries. These must become zone recipes or be folded into the director. I will preserve files but make them real enough for the next modules to use.

## Phase A — Proof and boot safety

Files:
- `AI_THOUGHTS/.../regionProofNow.mjs`
- `postbuild/MitzvahWorldPostBuild.js`
- `utils/AwtsmoosDiagnostics.js`
- `WorkerMessageInterceptor.js`

Goal:
- One small JSON proof, no giant logs.
- Postbuild stage marks.
- Region report/stats globals.

Verification:
- Node syntax.
- Browser CDP result shows worker progress stage and, eventually, region stats.

## Phase B — Ecology data core

New files:
- `region/ecology/EcologyRules.js`
- `region/ecology/EcologyGrid.js`
- `region/ecology/EcologySampler.js`
- `region/ecology/EcologyStats.js`

Exact behavior:
- Build a deterministic grid using spacing 8m for first pass, not 2m, to stay Android safe. The dream is 2m; the first safe implementation can scale down.
- Bounds from terrain recipe: about width 700, depth 420.
- Each cell has x/z, altitude proxy, slope proxy, moisture, fertility, sunlight, shade, traffic, biome, roadInfluence.
- Moisture rises near marsh/river/depressions and falls in highlands.
- Traffic rises near village and roads.
- Fertility rises in farms/orchards/valleys.
- Shade rises in forests/groves.

Verification:
- Report counts cells.
- Stats min/max/averages.

## Phase C — Biomes

Files:
- `region/biomes/BiomeDirector.js`
- `VillageCoreBiome.js`
- `OrchardBiome.js`
- `FarmBeltBiome.js`
- `ForestBiome.js`
- `MarshBiome.js`
- `RockyHighlandsBiome.js`

Exact behavior:
- Each biome exports a zone recipe.
- Director assigns each ecology cell to nearest/highest scoring biome.
- Return `zones`, `cellsByBiome`, `summary`.

Biome zones:
- villageCore: center around [0,0], radius 70, traffic high, vegetation low.
- farmBelt: southwest/west, radius 120, fertility high, rows allowed.
- orchardRing: south/east, radius 115, fruit tree density high.
- forestBelt: north/east, radius 160, shade high, trees high.
- ancientGrove: nested inside forest, radius 55, ancient landmark.
- marshlands: southeast depression, moisture high, reeds/frogs.
- rockyHighlands: north/northwest, altitude and rock high, goats.

## Phase D — Roads

Files:
- `region/roads/RoadNetwork.js`
- `ValleyRoadSolver.js`
- `WaterFlowSolver.js`
- `RegionRoadRenderer.js`

Exact behavior:
- Road graph contains named roads with points, width, material, traffic.
- Main yellow road connects village center, farm, orchard, forest edge, watch hill.
- Farm road branches into fields.
- Forest trail branches to ancient grove.
- Animal trails connect water, grazing, forest cover.
- Road wear map gives influence for grass suppression and flower edges.

## Phase E — Instance generation

Files:
- `region/instances/InstancePool.js`
- `InstancedGrassLayer.js`
- `InstancedFlowerLayer.js`
- `InstancedTreeLayer.js`
- `InstancedRockLayer.js`
- renderers under `region/render/`

Exact behavior:
- InstancePool samples ecology cells and produces arrays of specs.
- Grass density: high fertility, low traffic.
- Flowers: high sunlight, moderate moisture, road edges and meadow cells.
- Trees: forest/orchard/grove cells.
- Rocks: highlands and slope cells.
- Reeds: marsh cells.
- Mushrooms: forest shade/moisture.

First budget:
- grass 5000-9000 depending quality.
- flowers 1000-3000.
- trees 150-350.
- rocks 100-250.
- reeds 600.

## Phase F — Houses/interiors

Files:
- `region/houses/HousePlanner.js`
- `HouseProfessionCatalog.js`
- `HouseInteriorSpawner.js`
- `builders/buildCottage.js`
- `builders/furniture/*`

Exact behavior:
- Build a house plan of 8-14 houses, each role-linked.
- Assign NPC home/work destinations.
- Interiors should be low-poly furniture clusters that do not collide unless large.

## Phase G — Wildlife

Files:
- `WildlifeDirector.js`
- `AnimalSpeciesCatalog.js`
- `AnimalNeedsModel.js`
- `AnimalTerritories.js`
- `PredatorPreyScheduler.js`
- `RegionWildlifeRenderer.js`

Exact behavior:
- Director creates animals by biome.
- Runtime gives each animal state.
- First real behavior: flee/hunt/drink/graze/wander.
- Fox targets nearest rabbit within range; rabbit flees; deer flee player; goats prefer highlands.

## Phase H — NPC schedules

Files:
- `NpcScheduleDirector.js`
- `NpcRouteNetwork.js`
- `NpcProfessionBehaviors.js`
- `RegionNpcRuntime.js`

Exact behavior:
- Each NPC receives home/work/market/farm/road destination.
- Runtime moves NPCs along route segments.
- Schedule is time-of-day simulated from elapsed runtime if no world clock exists.

## Phase I — Collision

Files:
- `ColliderClassifier.js`
- `GroundedColliderBuilder.js`
- `MergedColliderBake.js`
- `OctreeBakeReport.js`
- `RegionColliderRuntime.js`

Exact behavior:
- Hard blockers only: houses, barns, wells, bridges, large rocks, fences.
- Merge into one hidden mesh and bake once.
- Report triangles/sources.

## First action chosen
Implement Phase B+C+D+E data pipeline first because it makes the existing director real and gives renderers a source of truth. Then integrate summary counts into `RegionBuildReport`. Then syntax check.

## Awtsmoos chapter
The second pass is the engineering scroll. The river of idea becomes channels, the channels become files, the files become vessels, and the vessels must carry actual coordinates and counts, not poetry alone.
