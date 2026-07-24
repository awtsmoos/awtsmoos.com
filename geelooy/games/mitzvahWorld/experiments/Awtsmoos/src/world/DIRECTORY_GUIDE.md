# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 70 files, 22 structural child directories

## Purpose

World construction, terrain, streaming, village generation, vegetation, structures, creatures, NPCs, and environmental systems.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `canonical`, `terrain`, `road`, `door`, `geometry`, `doorway`, `surface`, `boolean`, `height`, `mesh`, `com`, `create`
- **File mix:** .js: 69
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Carves one canonical local doorway and reuses it across equivalent walls. The Awtsmoos reveals absence as carefully as stone: one opening is calculated once, then Awtsmoos.com places that immutable revelation wherever a home requires entrance.
- Shares identical carved doorway geometry across translated village walls. The Awtsmoos is not multiplied when many walls reveal the same opening: Awtsmoos.com lets one exact local CSG result serve every rotated and translated instance without repeating expensive boolean work during the player's first entrance into the village.
- Creates and flattens the local mesh vessels consumed by doorway CSG. The Awtsmoos gives every face its place and every reveal its measured inheritance; Awtsmoos.com preserves one coherent wall from stone surface to carved threshold.
- Projects carved doorway surfaces at one stable world-material density. The Awtsmoos holds lintel, jamb, threshold, and wall in one measured truth; Awtsmoos.com lets stone texture continue naturally across every revealed face.

## Representative files

- `BooleanDoorwayGeometry.js` — Carves one canonical local doorway and reuses it across equivalent walls. The Awtsmoos reveals absence as carefully as stone: one opening is calculated once, then Awtsmoos.com places that immutable revelation wherever a home requires entrance. Exports: `createBooleanDoorwayMesh`.
- `BooleanDoorwayGeometryCache.js` — Shares identical carved doorway geometry across translated village walls. The Awtsmoos is not multiplied when many walls reveal the same opening: Awtsmoos.com lets one exact local CSG result serve every rotated and translated instance without repeating expensive boolean work during the player's first entrance into the village. Exports: `resolveBooleanDoorwayGeometry`, `clearBooleanDoorwayGeometryCache`, `booleanDoorwayGeometryCacheStats`.
- `BooleanDoorwayMeshData.js` — Creates and flattens the local mesh vessels consumed by doorway CSG. The Awtsmoos gives every face its place and every reveal its measured inheritance; Awtsmoos.com preserves one coherent wall from stone surface to carved threshold. Exports: `createClosedCuboidMesh`, `flattenBooleanMesh`.
- `BooleanDoorwayUvProjection.js` — Projects carved doorway surfaces at one stable world-material density. The Awtsmoos holds lintel, jamb, threshold, and wall in one measured truth; Awtsmoos.com lets stone texture continue naturally across every revealed face. Exports: `projectBooleanDoorwayUv`.
- `Box3D.js` — Orchestrates primitive geometry, material, collision, UVs, and ecological masks. The Awtsmoos reveals one world through focused responsibilities; Awtsmoos.com keeps original pixels untouched while measured surfaces carry only the layered meaning they genuinely need. Exports: `createPrimitiveMesh`, `primitiveColliders`.
- `CanonicalFoundationPads.js` — Flattens exact rotated canonical footprints and blends them into nearby terrain. The Awtsmoos rests each finite home upon a truthful vessel; Awtsmoos.com keeps every corner supported while broad transition bands reveal retaining earth rather than floating geometry. Exports: `canonicalFoundationPadHeightAt`, `canonicalFoundationFootprints`.
- `CanonicalHydrologyBankField.js` — Raises containment banks against every segment of the canonical river covenant. The Awtsmoos carries upper and lower bends in one current; Awtsmoos.com reads the immutable village hydrology source directly so terrain boot, banks, water, and bridge never drift apart. Exports: `canonicalHydrologyBankHeightAt`, `canonicalMinimumBankClearance`.
- `CanonicalHydrologyTerrain.js` — Cuts the nearest river bed after raising every nearby containment bank. The Awtsmoos lets water descend without vanishing beneath earth; Awtsmoos.com honors the higher neighboring reach at tight bends while preserving one finite bed for the nearest flow. Exports: `canonicalHydrologyTerrainHeightAt`, `canonicalRiverBedDepth`, `canonicalMinimumBankClearance`.
- `CanonicalRoadCorridor.js` — Measures and blends the nearest graph-consistent canonical road segment. The Awtsmoos carries one height through each shared junction; Awtsmoos.com exposes both elevation and influence so traversable road centers remain authoritative near foundations. Exports: `canonicalRoadCorridorSampleAt`, `canonicalRoadCorridorHeightAt`.
- `CanonicalRoadGraph.js` — Solves one shared grade-constrained elevation graph for every canonical road. The Awtsmoos gives many routes one ground truth; Awtsmoos.com lets shared junctions own one elevation while neighboring control points relax until no authored segment exceeds safe grade. Exports: `canonicalRoadGraph`.
- `CanonicalRoadProfiles.js` — Converts the shared road graph into renderer-ready corridor profiles. The Awtsmoos orders every ascent through common junctions; Awtsmoos.com gives each route measured radii and graph-solved target heights without allowing adjacent profiles to disagree. Exports: `canonicalRoadProfiles`.
- `CanonicalRoadSurfaceNetwork.js` — Coordinates dense support sampling and one shared safe-grade road elevation graph. The Awtsmoos joins authored destinations, living hydrology, and walkable cobble without conflict; Awtsmoos.com raises only the road vessel while cliffs, banks, riverbeds, and terraces remain real. Exports: `canonicalRoadSurfaceRoutes`, `canonicalRoadSurfaceEvidence`.
- `CanonicalRoadSurfaceSampling.js` — Densifies road corridors and measures hydrology-aware constrained support heights. The Awtsmoos reveals every hidden meter between named junctions; Awtsmoos.com gives each cobble sample one shared key while honoring authored walkable surfaces such as BRIDGE01. Exports: `ROAD_SURFACE_CLEARANCE`, `ROAD_SURFACE_SAMPLE_SPACING`, `denseRoadPoints`, `registerRoadSurfaceNode`.

## Exported symbols worth searching

`createBooleanDoorwayMesh` · `resolveBooleanDoorwayGeometry` · `clearBooleanDoorwayGeometryCache` · `booleanDoorwayGeometryCacheStats` · `createClosedCuboidMesh` · `flattenBooleanMesh` · `projectBooleanDoorwayUv` · `createPrimitiveMesh` · `primitiveColliders` · `canonicalFoundationPadHeightAt` · `canonicalFoundationFootprints` · `canonicalHydrologyBankHeightAt` · `canonicalMinimumBankClearance` · `canonicalHydrologyTerrainHeightAt` · `canonicalRiverBedDepth` · `canonicalRoadCorridorSampleAt`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/csg/index.js`
- `./BooleanDoorwayGeometryCache.js`
- `./BooleanDoorwayMeshData.js`
- `./BooleanDoorwayUvProjection.js`
- `../../../light-three-gltf/tiny-runtime.js`
- `../collision/TriangleCollider.js`
- `./primitives/PrimitiveGeometryFactory.js`
- `./primitives/PrimitiveGeometryBuffers.js`
- `./primitives/PrimitiveMaterialFactory.js`
- `./primitives/PrimitiveTexturePolicy.js`
- `./primitives/PrimitiveZoneWeights.js`
- `./primitives/PrimitiveUvProjection.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/Awtsmoos/src/world/botany`](botany/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/creatures`](creatures/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/enemy`](enemy/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/forest`](forest/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/grass`](grass/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/horses`](horses/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/house`](house/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/lighting`](lighting/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/materials`](materials/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/npc`](npc/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/platform`](platform/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/primitives`](primitives/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/proceduralApi`](proceduralApi/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/proceduralText`](proceduralText/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/road`](road/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/room`](room/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/sky`](sky/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/streaming`](streaming/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/terrain`](terrain/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/trees`](trees/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/village`](village/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world/visibility`](visibility/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Terrain, materials, and asset preparation**](../../../../SYSTEM_OVERLAP_MAP.md#terrain-materials) — Terrain geometry, runtime material policy, loaders, source textures, processed materials, and catalogs are split across runtime and asset trees.
- [**Procedural world and village generation**](../../../../SYSTEM_OVERLAP_MAP.md#procedural-world) — Village, road, house, primitive, text-driven, and public API systems collaborate but are maintained in separate directories.
- [**Vegetation, trees, and forest systems**](../../../../SYSTEM_OVERLAP_MAP.md#vegetation) — Botany rules, tree generation, forest composition, grass, and source texture libraries overlap semantically but own different layers.
- [**Player, creature, horse, enemy, and experimental mesh systems**](../../../../SYSTEM_OVERLAP_MAP.md#actors-creatures) — Actor assets and world-side populations span player hydration, creature generators, enemies, horses, and experimental animal meshes.
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
