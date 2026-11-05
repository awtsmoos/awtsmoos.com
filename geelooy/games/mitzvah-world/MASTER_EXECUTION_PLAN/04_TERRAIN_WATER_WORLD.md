B"H
Boruch Hashem
Blessed be He

# 04 — Terrain, Geology, Hydrology, Roads, Architecture, World Building

## One environmental field
Terrain cells should expose elevation, slope, aspect, soil, rockiness, drainage, moisture, temperature, sunlight, wind exposure, disturbance, water table, and biome intent. Vegetation, roads, buildings, weather, wildlife, and NPCs consume the same field.

## Terrain / geology
- [ ] deterministic streamed terrain with seamless cell borders and stable seeds;
- [ ] geological strata: organic layer, soil/clay/gravel, rock, bedrock;
- [ ] coherent cliff/rock geology rather than decorative random scatter;
- [ ] erosion forms: gullies, ravines, scree, talus, exposed roots, flood deposits;
- [ ] landslide/rockfall/avalanche corridors where topology/climate supports them;
- [ ] material transitions blend by slope, moisture, geology, wear, altitude, and biome;
- [ ] terrain LOD preserves silhouette and hydrology; no popping rivers/roads at chunk edges;
- [ ] distant terrain integrates atmospheric/forest statistical cover.

## Hydrology
- [ ] watershed/catchment authority; streams flow downhill through plausible drainage basins;
- [ ] springs/water table/wetlands/riparian zones;
- [ ] connected river → bridge/ford → lake/rapids/waterfall → downstream continuation;
- [ ] seasonal flow, rain response, snowmelt response, floodplain state, bank erosion;
- [ ] water depth/velocity/turbidity/foam/shallow/deep intent;
- [ ] waterfalls physically connect upstream/downstream and emit spray/mist intent;
- [ ] puddles, roof runoff, road runoff, temporary channels, evaporation/drying;
- [ ] freeze/thaw/ice hooks; seasonal/intermittent streams where appropriate.
## Roads / infrastructure
- [ ] hierarchy: footpath, alley, village street, farm road, regional road;
- [ ] roads follow slope, crossings, settlement needs, bridges/culverts/fords rather than noise;
- [ ] wear from traffic: compaction, ruts, mud, dust, erosion, snow tracks;
- [ ] bridges: wood/stone/rope/causeway/ford variants with real collision/navigation;
- [ ] bridge/build transactions atomic and idempotent; repaired geometry persists exactly once;
- [ ] wells, drainage channels, retaining walls, stairs, terraces, irrigation, gutters and runoff connect to environment.

## Settlements / architecture
- [ ] settlement planner coordinates roads, water access, houses, markets, community buildings, farms, gardens, orchards, public spaces;
- [ ] real doors, stairs, windows, rooms, collision, interiors for important buildings;
- [ ] furnishing grammar by room purpose: beds, tables, shelves, books, ovens, storage, workspaces;
- [ ] occupancy ownership: who lives/works here, opening hours, inventory/resources, schedules;
- [ ] district identity and functional land use, not visual labels only;
- [ ] climate-aware architecture: roof pitch, drainage, courtyards, materials, shade, snow handling;
- [ ] village/city growth history and building age/repair state;
- [ ] architecture avoids inappropriate religious motifs; important Jewish buildings/signage require art/content review.

## City authority before official release
- [ ] distinct city center, market/commercial, civic/community, educational, residential, craft/industrial, gardens, outskirts;
- [ ] streets/alleys/plazas, multi-story verticality, doors/interiors, regional transit/roads;
- [ ] population streaming and crowd LOD;
- [ ] outskirts transition to farms/orchards/river/forest/mountains rather than abrupt city wall;
- [ ] city has its own manifest/boot acceptance and is never a renamed Village.

## World-building quality
- [ ] preserve vistas/landmark sightlines; avoid random trees/buildings blocking every scenic composition;
- [ ] generate natural settlement hierarchy: center → neighborhoods → outskirts → farms → wilderness;
- [ ] support authored landmarks while procedural systems fill around them;
- [ ] all generated objects expose stable IDs, generator/seed/provenance, semantic role, LOD, collision intent, persistence identity.