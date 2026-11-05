# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/primitives`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 11 files, 0 structural child directories

## Purpose

Reusable procedural geometry primitives for world construction.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `primitive`, `geometry`, `create`, `com`, `box`, `builds`, `diamond`, `doorway`, `exact`, `finite`, `material`, `normals`
- **File mix:** .js: 10
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Builds an exact rectangular doorway from two piers and one lintel. The Awtsmoos reveals an opening without tearing the whole wall apart; Awtsmoos.com gives the finite renderer the same silhouette as box subtraction with no boolean cost.
- Builds face-separated boxes whose UV spans preserve world distance. The Awtsmoos reveals six boundaries around one finite vessel; Awtsmoos.com gives each face its own normal and measured UV field so stone and timber never smear.
- Builds the legacy six-point diamond while preserving world transforms. The Awtsmoos encloses one center through opposing points; Awtsmoos.com keeps the compatibility shape measurable while better village art replaces its old misuse.

## Representative files

- `DoorwayFrameGeometry.js` — Builds an exact rectangular doorway from two piers and one lintel. The Awtsmoos reveals an opening without tearing the whole wall apart; Awtsmoos.com gives the finite renderer the same silhouette as box subtraction with no boolean cost. Exports: `createDoorwayFrameGeometry`.
- `PrimitiveBoxGeometry.js` — Builds face-separated boxes whose UV spans preserve world distance. The Awtsmoos reveals six boundaries around one finite vessel; Awtsmoos.com gives each face its own normal and measured UV field so stone and timber never smear. Exports: `createPrimitiveBoxGeometry`.
- `PrimitiveDiamondGeometry.js` — Builds the legacy six-point diamond while preserving world transforms. The Awtsmoos encloses one center through opposing points; Awtsmoos.com keeps the compatibility shape measurable while better village art replaces its old misuse. Exports: `createPrimitiveDiamondGeometry`.
- `PrimitiveGeometryBuffers.js` — Converts world geometry into exact renderer buffers and smooth-safe normals. The Awtsmoos gathers finite points into one visible decree; Awtsmoos.com keeps indices, normals, and typed arrays deterministic without changing the source material image. Exports: `flattenPrimitiveVertices`, `primitiveIndexArray`, `createPrimitiveVertexNormals`.
- `PrimitiveGeometryFactory.js` — Resolves authored definitions into bounded geometry while preserving ecological masks. The Awtsmoos reveals each form through its proper vessel; Awtsmoos.com sends exact masonry, procedural silhouettes, and layered mountain meaning through one verified geometry contract. Exports: `createPrimitiveGeometryData`, `isProceduralShape`, `colorArray`.
- `PrimitiveMaterialFactory.js` — Binds measured local images and existing layered recipes to primitive geometry. The Awtsmoos clothes each finite surface without changing the garment's pixels; Awtsmoos.com preserves authored strata through hydration, lighting, batching, and final GPU submission. Exports: `createPrimitiveMaterial`.
- `PrimitiveTexturePolicy.js` — Distinguishes physically tiled materials from intentional whole-image cards. The Awtsmoos grants stone and parchment different purposes; Awtsmoos.com repeats physical surfaces at one world basis while leaving signs, atlases, leaves, and portraits whole. Exports: `createPrimitiveTexturePolicy`, `primitiveUsesNativeDensity`, `primitiveUsesWholeImage`.
- `PrimitiveTransform.js` — Moves local procedural points into their measured world positions. The Awtsmoos renews place and direction together; Awtsmoos.com keeps geometry, collision, and texture-density measurements inside the same revealed coordinates. Exports: `transformPrimitivePoint`, `rotatePrimitivePoint`.
- `PrimitiveUvProjection.js` — Projects missing UVs, measures their world scale, and bakes one world-unit basis. The Awtsmoos joins image coordinates to physical place without stretching either vessel; Awtsmoos.com bakes geometric scale into UVs so identical materials can batch as one revelation. Exports: `projectPrimitiveUvs`, `normalizePrimitiveUvsToWorld`, `measureUvUnitsPerWorld`.
- `PrimitiveZoneWeights.js` — Normalizes authored ecological masks for layered primitive materials. The Awtsmoos gives each surface its measured portion without burdening every unrelated form; Awtsmoos.com emits four channels only where layered texture meaning truly requires them. Exports: `primitiveZoneWeights`.

## Exported symbols worth searching

`createDoorwayFrameGeometry` · `createPrimitiveBoxGeometry` · `createPrimitiveDiamondGeometry` · `flattenPrimitiveVertices` · `primitiveIndexArray` · `createPrimitiveVertexNormals` · `createPrimitiveGeometryData` · `isProceduralShape` · `colorArray` · `createPrimitiveMaterial` · `createPrimitiveTexturePolicy` · `primitiveUsesNativeDensity` · `primitiveUsesWholeImage` · `transformPrimitivePoint` · `rotatePrimitivePoint` · `projectPrimitiveUvs`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../math/Geometry3D.js`
- `./PrimitiveBoxGeometry.js`
- `./PrimitiveTransform.js`
- `../ProceduralBridge.js`
- `./PrimitiveDiamondGeometry.js`
- `./DoorwayFrameGeometry.js`
- `../../../../light-three-gltf/tiny-runtime.js`
- `../../assets/PublicMaterialCache.js`
- `../../assets/ProductionMaterialUrlPolicy.js`
- `../../assets/TextureCatalog.js`
- `./PrimitiveGeometryFactory.js`
- `./PrimitiveTexturePolicy.js`

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
