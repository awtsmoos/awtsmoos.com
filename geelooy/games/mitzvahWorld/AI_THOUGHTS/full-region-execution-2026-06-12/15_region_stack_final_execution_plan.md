B'H
# 15 — Final Execution Plan Before Writing Files

This is the final plan for the current implementation batch. It does not claim to complete the whole kingdom. It claims to take the next correct concrete step: make the region director produce real ecology/biome/road/instance data and measurable reports, so the next renderer pass can consume truth instead of guessing.

## Original user objective
The user wants the village transformed into a full region simulation stack: terrain, ecology, biomes, roads, farms, houses, wildlife, NPC schedules, landmarks, colliders, and runtime proof. The user explicitly rejects placeholder architecture. Therefore the work must visibly or measurably change behavior.

## Current actual state from files
- `region/` exists with many folders.
- `MitzvahRegionDirector.js` wires modules but shallowly.
- `BiomeDirector.js` simply returns six small biome entries.
- `RoadNetwork.js` returns fixed paths with tiny metadata.
- `InstancePool.js` returns planned layers from tiny modules.
- `RegionBuildReport.js` returns a shallow summary.
- `LivingRegionRuntime.js` currently renders with fallback/default renderer logic and mostly does not consume detailed report instance plans.
- Boot proof recently reached heescheel and sometimes postbuild, but living runtime proof is still not fully stable.

## Decision for this batch
Write the data spine. Do not yet rewrite all renderers. The reason is that renderer work without a rich report becomes another independent decorative system. The correct order is:

1. Data truth.
2. Report proof.
3. Renderer consumption.
4. Runtime visual proof.

This batch covers 1 and 2.

## Files to write now

### New file: `region/ecology/EcologyRules.js`
Responsibilities:
- deterministic helpers: clamp, distance, influence.
- compute road influence.
- score a cell against biome zones.
- calculate moisture/fertility/sunlight/shade/traffic.
- no Three.js imports.
- under 120 lines.

### New file: `region/ecology/EcologyGrid.js`
Responsibilities:
- generate cells within bounds.
- use spacing 10m default for Android safety.
- classify every cell with biome.
- include x/z, moisture, fertility, traffic, shade, sunlight, altitude, slope, roadInfluence, waterInfluence.
- return `{ bounds, spacing, cells, summary }`.

### New file: `region/ecology/EcologyStats.js`
Responsibilities:
- count cells by biome.
- min/max/average for moisture/fertility/traffic/shade.
- produce compact summary.

### Rewrite: `region/biomes/BiomeDirector.js`
Responsibilities:
- define actual zone recipes.
- include village, farm, orchard, forest, ancient grove, marsh, rocky highlands, wilderness.
- export `buildBiomePlan(context)` returning zones and summary.

### Rewrite: `region/roads/RoadNetwork.js`
Responsibilities:
- build named road segments with points, width, material, traffic, type.
- include main road, farm road, orchard lane, forest trail, animal trail, ridge path, marsh boardwalk placeholder path.
- include bridges/intersections.

### Rewrite: `region/instances/InstancePool.js`
Responsibilities:
- generate concrete instance specs from ecology cells.
- produce grass/flowers/trees/rocks/reeds/mushrooms/debris arrays.
- cap counts using deterministic modulus and cell properties.
- return totals and budgets.

### Rewrite: `region/debug/RegionBuildReport.js`
Responsibilities:
- summarize cells, biomes, roads, houses, wildlife, NPC schedules, colliders, instances.
- expose `visibleInstances` and `hardColliders` counts.
- stop returning only shallow counts.

### Rewrite: `region/MitzvahRegionDirector.js`
Responsibilities:
- call terrain, biomes, roads, ecology, houses, instances, wildlife, NPC schedules, colliders.
- store report on olam.
- post compact director report.
- include ecology in report.

### New diary: `16_region_data_spine_diary.md`
Responsibilities:
- record exactly what was written.
- record what remains.

## Verification
Run `nodeCheckFiles` on every touched JS file.
If syntax passes, run at least a director import smoke if possible. If browser proof is too costly, record that runtime visual proof remains next.

## Remaining after this batch
- Renderers must consume `report.instances`.
- `LivingRegionRuntime.js` must pass report to renderers.
- Postbuild order must be proof-first.
- Wildlife AI must consume ecology territories.
- NPC runtime must consume route/home/work plans.
- Collision runtime must consume collider source plans.
- Browser proof must show `AWTSMOOS_LIVING_REGION_REPORT` and `AWTSMOOS_LIVING_REGION_STATS`.

## Awtsmoos chapter
Now the quill lowers. The plans are not enough. The Awtsmoos creates the land anew every instant, and these files must become vessels that hold actual cells, roads, zones, and counts. If the report does not grow, the world has not grown. If the renderer does not later obey, the world still sleeps. This batch awakens the report.
