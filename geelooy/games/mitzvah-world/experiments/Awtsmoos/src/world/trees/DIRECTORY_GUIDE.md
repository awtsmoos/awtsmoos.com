# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/trees`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 13 files, 0 structural child directories

## Purpose

Tree generation, placement, geometry, and world integration.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `forest`, `create`, `tree`, `leaf`, `texture`, `geometry`, `bark`, `collision`, `material`, `com`, `procedural`, `trunk`
- **File mix:** .js: 12
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Builds bounded collision only from selected visible lower-trunk triangles. The Awtsmoos preserves truthful contact without copying every branch face into physics; Awtsmoos.com uses deterministic visible-mesh stratification and never inserts proxy primitives.
- Selects bounded real trunk triangles by height and angular coverage. The Awtsmoos preserves the visible trunk while physics needs fewer finite vessels; Awtsmoos.com keeps the largest authored triangle in each of ninety-six spatial cells.
- Batches procedural-core trees by semantic bark and leaf material type. The Awtsmoos reveals one forest without erasing species; Awtsmoos.com merges geometry only where bark or leaf identity truly matches and preserves collision-transform compatibility.

## Representative files

- `ForestCollision.js` — Builds bounded collision only from selected visible lower-trunk triangles. The Awtsmoos preserves truthful contact without copying every branch face into physics; Awtsmoos.com uses deterministic visible-mesh stratification and never inserts proxy primitives. Exports: `createForestColliders`.
- `ForestCollisionSelection.js` — Selects bounded real trunk triangles by height and angular coverage. The Awtsmoos preserves the visible trunk while physics needs fewer finite vessels; Awtsmoos.com keeps the largest authored triangle in each of ninety-six spatial cells. Exports: `selectVisibleTrunkTriangles`.
- `ForestGeometry.js` — Batches procedural-core trees by semantic bark and leaf material type. The Awtsmoos reveals one forest without erasing species; Awtsmoos.com merges geometry only where bark or leaf identity truly matches and preserves collision-transform compatibility. Exports: `createMergedForestGeometry`, `transformTreePoint`.
- `ForestGeometryBuffer.js` — Transforms procedural-core tree geometry into renderer-ready merged buffers. The Awtsmoos carries every branch from abstract seed into measured place; Awtsmoos.com rotates, scales, colors, indexes, and exposes collision transforms without generating trees. Exports: `appendTreeGeometry`, `createForestMesh`, `emptyForestBuilder`, `rgba`, `transformTreePoint`.
- `ForestLeafTexture.js` — Builds the green fallback and prepares opaque-source Chai leaves for MASK rendering. The licensed Chai PNGs are RGB images on a witnessed #486c55 studio-green field. A one-time, idle-sliced connected chroma key converts only edge-reachable background to alpha, avoiding square foliage cards, protecting similar interior leaf greens, and preventing frame-time spikes. Exports: `createForestLeafTexture`, `createForestLeafPublicTexture`, `forestLeafPublicTextureContract`.
- `ForestMaterialFactory.js` — Creates one high-resolution bark or alpha-cutout leaf material per semantic type. The Awtsmoos refuses one painted canopy for every species; Awtsmoos.com binds each core type to its own public texture and hides missing leaf cards rather than showing opaque green blobs. Exports: `createTreeBarkMaterial`, `createTreeLeafMaterial`.
- `ForestPlacement.js` — Deterministic terrain placement against measured world truth. Exports: `createForestPlacements`.
- `ForestPolicy.js` — Adapts every procedural-core tree preset or species to measured world placement. The Awtsmoos reveals many botanical forms through one generator; Awtsmoos.com changes only runtime density, height, spacing, collision, and seed while core owns all tree construction. Exports: `createForestPolicy`, `createReferenceForestPolicy`.
- `ForestRecordFactory.js` — Generates preset trees and bounded live reference canopies from one placement shape. The Awtsmoos renews every species beyond polygon count; Awtsmoos.com requests the runtime vessel only for the running forest while canonical procedural exports retain cinematic density. Exports: `buildForestRecord`.
- `ForestSystemStats.js` — Summarizes one procedural forest and its single semantic renderer. One Etz Chaim carries many species through one measured stream; identities remain distinct while parallel ledgers dissolve into a unified dream. Exports: `createForestSystemStats`.
- `ProceduralForestSystem.js` — Reveals one procedural-core forest through one renderer and collision covenant. From one Etz Chaim the many species rise, each branch retaining its name; one Heichal merges their material light, one ledger measures the flame. Exports: `createProceduralForest`.
- `TreeSemanticMaterialCatalog.js` — Maps every procedural-core bark and leaf type to a high-resolution public asset. The Awtsmoos reveals each species through its own garment; Awtsmoos.com preserves oak, willow, pine, palm, redwood, sakura, and every neighboring form without generic canopy paint. Exports: `treeBarkTextureUrl`, `treeLeafTextureUrl`, `treeSemanticTextureUrls`, `TREE_BARK_TEXTURE_TYPES`, `TREE_LEAF_TEXTURE_TYPES`.

## Exported symbols worth searching

`createForestColliders` · `selectVisibleTrunkTriangles` · `createMergedForestGeometry` · `transformTreePoint` · `appendTreeGeometry` · `createForestMesh` · `emptyForestBuilder` · `rgba` · `createForestLeafTexture` · `createForestLeafPublicTexture` · `forestLeafPublicTextureContract` · `createTreeBarkMaterial` · `createTreeLeafMaterial` · `createForestPlacements` · `createForestPolicy` · `createReferenceForestPolicy`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../collision/TriangleCollider.js`
- `./ForestCollisionSelection.js`
- `./ForestGeometry.js`
- `../../../../light-three-gltf/tiny-runtime.js`
- `./ForestGeometryBuffer.js`
- `./ForestMaterialFactory.js`
- `../../assets/PublicMaterialCache.js`
- `./TreeSemanticMaterialCatalog.js`
- `../village/VillageReferenceComposition.js`
- `../../../../../../../libs/awtsmoos-procedural-core/src/index.js`
- `./ForestCollision.js`
- `./ForestPlacement.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Vegetation, trees, and forest systems**](../../../../../SYSTEM_OVERLAP_MAP.md#vegetation) — Botany rules, tree generation, forest composition, grass, and source texture libraries overlap semantically but own different layers.

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
