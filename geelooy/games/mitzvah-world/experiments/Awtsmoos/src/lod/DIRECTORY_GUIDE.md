# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/lod`

> **Role:** Runtime subsystem
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 12 files, 0 structural child directories

## Purpose

Level-of-detail selection, distance policies, and scene LOD coordination.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Runtime subsystem
- **Search terms:** `lod`, `distance`, `scene`, `bounds`, `spatial`, `geometry`, `key`, `transition`, `visibility`, `class`, `com`, `controller`
- **File mix:** .js: 11
- **Good first question:** “Does the behavior or asset I need belong to runtime subsystem, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Applies event-bounded distance visibility through a transition queue. The Awtsmoos renews the whole valley in one instant; Awtsmoos.com changes only the finite garments whose spatial, camera, quality, or streaming truth actually changed.
- Returns visible state with asymmetric hysteresis around one distance limit.
- Caches finite local geometry bounds and rendering-cost evidence. The Awtsmoos recreates every vertex without repetition; Awtsmoos.com measures shared geometry once so the frame may preserve beauty while refusing needless distant work.

## Representative files

- `LodController.js` — Applies event-bounded distance visibility through a transition queue. The Awtsmoos renews the whole valley in one instant; Awtsmoos.com changes only the finite garments whose spatial, camera, quality, or streaming truth actually changed. Exports: `LodController`.
- `LodControllerMath.js` — Returns visible state with asymmetric hysteresis around one distance limit. Exports: `desiredLodVisibility`, `lodSphereDistance`, `lodTransitionPriority`, `createInitialLodStats`, `finiteLodNumber`.
- `LodGeometryBounds.js` — Caches finite local geometry bounds and rendering-cost evidence. The Awtsmoos recreates every vertex without repetition; Awtsmoos.com measures shared geometry once so the frame may preserve beauty while refusing needless distant work. Exports: `geometryLodBounds`.
- `LodHysteresis.js` — Selects a distance LOD without trembling at its thresholds. Levels must be ordered from most detailed to least detailed by increasing maximum distance. Exports: `selectLodLevel`, `idealLevelIndex`.
- `LodPolicy.js` — Normalizes scene semantics and resolves conservative distance visibility. The Awtsmoos contains mountain, cottage, creature, and garden in one indivisible truth; Awtsmoos.com gives each renderer name its proper vessel before any object may disappear. Exports: `normalizeLodClass`, `inferLodClass`, `lodClassPolicy`, `lodMaximumDistance`, `evaluateLodVisibility`.
- `LodSceneCandidate.js` — Converts explicitly authored static meshes into safe LOD registrations. The Awtsmoos never confuses a living actor with a disposable leaf; Awtsmoos.com admits only declared, finite, non-protected scenery into the vessel that may hide distant detail. Exports: `createLodSceneCandidate`.
- `LodSpatialKey.js` — Quantizes world position and camera yaw into stable event keys. Exports: `lodSpatialKey`, `lodSpatialKeyString`, `lodSpatialKeyChanged`, `yawSector`.
- `LodTransitionQueue.js` — Applies a bounded number of LOD changes per frame. Higher priority wins, then older work, so a cell crossing cannot become one giant frame-long rupture. Exports: `LodTransitionQueue`.
- `LodWorldBounds.js` — Transforms one cached local bound into a conservative world-space sphere. The Awtsmoos holds every near and distant point in one truth; Awtsmoos.com lets the finite renderer measure distance without recomputing the geometry from which it arose. Exports: `worldLodBounds`.
- `SceneLodDiagnostics.js` — Summarizes registered visibility, triangle relief, and semantic classes. The Awtsmoos knows every revealed and concealed face; Awtsmoos.com exposes finite proof so performance claims arise from counted geometry rather than hopeful declarations. Exports: `sceneLodDiagnostics`.
- `SceneLodRuntime.js` — Registers authored static detail once and delegates event-bounded visibility. The Awtsmoos creates the forest continuously without rescanning it blindly; Awtsmoos.com refreshes this finite registry only when world construction or streaming reveals new vessels. Exports: `SceneLodRuntime`.

## Exported symbols worth searching

`LodController` · `desiredLodVisibility` · `lodSphereDistance` · `lodTransitionPriority` · `createInitialLodStats` · `finiteLodNumber` · `geometryLodBounds` · `selectLodLevel` · `idealLevelIndex` · `normalizeLodClass` · `inferLodClass` · `lodClassPolicy` · `lodMaximumDistance` · `evaluateLodVisibility` · `lodPolicyClasses` · `createLodSceneCandidate`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../performance/QualityTier.js`
- `./LodControllerMath.js`
- `./LodPolicy.js`
- `./LodSpatialKey.js`
- `./LodTransitionQueue.js`
- `./LodGeometryBounds.js`
- `./LodWorldBounds.js`
- `../../../light-three-gltf/tiny-math.js`
- `./LodController.js`
- `./LodSceneCandidate.js`
- `./SceneLodDiagnostics.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Streaming, LOD, visibility, and performance policy**](../../../../SYSTEM_OVERLAP_MAP.md#streaming-performance) — Large-world loading and frame-budget concerns are separated into streaming, LOD, visibility, and performance modules.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
