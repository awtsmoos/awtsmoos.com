# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/proceduralText`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 6 files, 0 structural child directories

## Purpose

Text-driven procedural-world interpretation and generation.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `text`, `mesh`, `responsibility`, `adapter`, `landmark`, `position`, `architectural`, `collision`, `does`, `non`, `not`, `procedural`
- **File mix:** .js: 5
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- RESPONSIBILITY: Own the complete lifecycle of one live procedural landmark. NON-RESPONSIBILITY: This system does not own terrain assembly or octree insertion. ARCHITECTURAL POSITION: Tiferes harmonizes parser, adapter, ground, and boundary.
- RESPONSIBILITY: Validate collision input and create project TriangleColliders. NON-RESPONSIBILITY: This file does not insert colliders into an octree. ARCHITECTURAL POSITION: Gevurah bounds visible generosity with physical law.
- RESPONSIBILITY: Own stable descriptions, placement intent, and semantic names. NON-RESPONSIBILITY: This file does not generate, render, or collide geometry. ARCHITECTURAL POSITION: Keser states the purpose before Binah parses the words.

## Representative files

- `ProceduralTextLandmarkSystem.js` — RESPONSIBILITY: Own the complete lifecycle of one live procedural landmark. NON-RESPONSIBILITY: This system does not own terrain assembly or octree insertion. ARCHITECTURAL POSITION: Tiferes harmonizes parser, adapter, ground, and boundary. Exports: `TiferesProceduralTextLandmarkSystem`, `createProceduralTextLandmark`.
- `TextMeshCollisionAdapter.js` — RESPONSIBILITY: Validate collision input and create project TriangleColliders. NON-RESPONSIBILITY: This file does not insert colliders into an octree. ARCHITECTURAL POSITION: Gevurah bounds visible generosity with physical law. Exports: `GevurahTextMeshCollisionAdapter`.
- `TextMeshLandmarkCatalog.js` — RESPONSIBILITY: Own stable descriptions, placement intent, and semantic names. NON-RESPONSIBILITY: This file does not generate, render, or collide geometry. ARCHITECTURAL POSITION: Keser states the purpose before Binah parses the words. Exports: `TEXT_MESH_LANDMARKS`, `getTextMeshLandmark`.
- `TextMeshWorldTransform.js` — RESPONSIBILITY: Apply one explicit translation contract to collision vertices. NON-RESPONSIBILITY: This module does not rotate, scale, render, or generate meshes. ARCHITECTURAL POSITION: Yesod carries local form toward world manifestation. Exports: `validateTextMeshWorldPosition`, `textMeshWorldVertices`.
- `TinyTextMeshGeometryAdapter.js` — RESPONSIBILITY: Validate renderer payloads and manifest Tiny geometry and mesh. NON-RESPONSIBILITY: This adapter does not parse text or create collision bodies. ARCHITECTURAL POSITION: Yesod connects the stable recipe domain to Malchus. Exports: `YesodTinyTextMeshAdapter`.

## Exported symbols worth searching

`TiferesProceduralTextLandmarkSystem` · `createProceduralTextLandmark` · `GevurahTextMeshCollisionAdapter` · `TEXT_MESH_LANDMARKS` · `getTextMeshLandmark` · `validateTextMeshWorldPosition` · `textMeshWorldVertices` · `YesodTinyTextMeshAdapter`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../../../../../../libs/awtsmoos-procedural-core/src/index.js`
- `../village/VillageGroundSampling.js`
- `./TextMeshCollisionAdapter.js`
- `./TextMeshLandmarkCatalog.js`
- `./TinyTextMeshGeometryAdapter.js`
- `../../collision/TriangleCollider.js`
- `./TextMeshWorldTransform.js`
- `../../math/Geometry3D.js`
- `../../../../light-three-gltf/tiny-runtime.js`

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
