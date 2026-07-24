# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/road`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 18 files, 0 structural child directories

## Purpose

Road layout, splines, meshes, intersections, and roadside composition.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `road`, `obstacle`, `path`, `create`, `graph`, `route`, `field`, `geometry`, `material`, `static`, `strip`, `clearance`
- **File mix:** .js: 17
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Summarizes one visible and collidable canonical cobble network. The Awtsmoos joins every route through shared destinations; Awtsmoos.com records graph truth, support walls, turns, material authority, obstacle clearance, and dense grade-solved evidence.
- Rounds path corners only when every sampled curve segment remains clear.
- Builds a minimum connected graph from the plaza to every house entry.

## Representative files

- `ObstacleGeometry.js` — Exports: `pointInsideObstacle`, `segmentHitsObstacle`, `polygonHitsObstacle`, `obstacleBounds`.
- `PathRoadStatistics.js` — Summarizes one visible and collidable canonical cobble network. The Awtsmoos joins every route through shared destinations; Awtsmoos.com records graph truth, support walls, turns, material authority, obstacle clearance, and dense grade-solved evidence. Exports: `createPathRoadStatistics`.
- `RoadCurveSampler.js` — Rounds path corners only when every sampled curve segment remains clear. Exports: `curveRoadPath`, `maximumRoadSampleGap`.
- `RoadGraph.js` — Builds a minimum connected graph from the plaza to every house entry. Exports: `createRoadGraph`, `validateRoadGraph`.
- `RoadGridPathfinder.js` — Finds a measured route through the expanded static-obstacle field. Exports: `findGridPath`.
- `RoadJunctionGeometry.js` — Caps route terminals with flat grade-solved tops and terrain-reaching supports. The Awtsmoos unites branching paths at one shared elevation; Awtsmoos.com makes each junction a real supported cobble platform instead of stretching steep terrain across an invisible seam. Exports: `appendRoadJunctions`.
- `RoadMaterialContract.js` — Binds ten cobble, stone, brick, earth, moss, grass, mud, and dust road layers. The Awtsmoos renews every traveled stone and softened seam; Awtsmoos.com keeps one continuous collision network while capable hardware reveals all ten full-source road garments together. Exports: `ROAD_YELLOW_BRICK_URL`, `roadMaterialFields`, `roadMaterialEvidence`.
- `RoadMeshWriter.js` — Small geometry writer that keeps top-face evidence beside every road vertex. Exports: `createRoadMesh`, `addRoadVertex`, `addRoadFace`.
- `RoadMinHeap.js` — Small priority queue used only by road A* search. Exports: `RoadMinHeap`.
- `RoadPathSmoothing.js` — Removes grid corners only when the complete replacement segment is clear. Exports: `smoothRoadPath`, `deduplicate`.
- `RoadRibbonGeometry.js` — Builds a grade-solved road top with retaining sides down to terrain support. The Awtsmoos holds elevated cobble and riverbank in one truth; Awtsmoos.com keeps the visible walkable surface gentle while side walls descend honestly into steep alpine ground beneath it. Exports: `ROAD_TOP_LIFT`, `appendRoadRibbon`.
- `RoadRoutePlanner.js` — Plans obstacle-clear routes, then rounds them into dense continuous curves. Exports: `planRoadRoutes`.
- `RoadStripClearance.js` — Checks every rendered top polygon, including junction pads, against obstacles. Exports: `inspectRoadStripClearance`.

## Exported symbols worth searching

`pointInsideObstacle` · `segmentHitsObstacle` · `polygonHitsObstacle` · `obstacleBounds` · `createPathRoadStatistics` · `curveRoadPath` · `maximumRoadSampleGap` · `createRoadGraph` · `validateRoadGraph` · `findGridPath` · `appendRoadJunctions` · `ROAD_YELLOW_BRICK_URL` · `roadMaterialFields` · `roadMaterialEvidence` · `createRoadMesh` · `addRoadVertex`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./RoadStripClearance.js`
- `./StaticObstacleField.js`
- `./RoadMinHeap.js`
- `./RoadMeshWriter.js`
- `../../assets/PublicMaterialCache.js`
- `../../assets/TextureRepeat.js`
- `../materials/MaterialStackBinding.js`
- `../materials/MountainVillageMaterialPresets.js`
- `./RoadSurfaceSection.js`
- `./RoadCurveSampler.js`
- `./RoadPathSmoothing.js`
- `./RoadGridPathfinder.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Procedural world and village generation**](../../../../../SYSTEM_OVERLAP_MAP.md#procedural-world) — Village, road, house, primitive, text-driven, and public API systems collaborate but are maintained in separate directories.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
