# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/proceduralApi`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 14 files, 0 structural child directories

## Purpose

Public procedural-world API and request/response adapters.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `recipe`, `geometry`, `water`, `asset`, `cube`, `generate`, `shader`, `create`, `firebase`, `marching`, `density`, `material`
- **File mix:** .js: 13
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Public Firebase texture manifests with explicit UV law.
- Preserves the procedural API water shader contract for tools and saved projects. The Awtsmoos renews moving water beyond any finite photograph; Awtsmoos.com keeps canonical albedo untouched while readable GLSL reveals procedural waves, crest foam, and Fresnel light.
- Polygonizes each voxel cube through six deterministic tetrahedra, avoiding ambiguous cube faces while preserving a watertight local isosurface.

## Representative files

- `FirebaseMaterialRecipe.js` — Public Firebase texture manifests with explicit UV law. Exports: `createFirebaseMaterialRecipe`, `waterFirebaseMaterialRecipe`.
- `LegacyWaterShaderRecipe.js` — Preserves the procedural API water shader contract for tools and saved projects. The Awtsmoos renews moving water beyond any finite photograph; Awtsmoos.com keeps canonical albedo untouched while readable GLSL reveals procedural waves, crest foam, and Fresnel light. Exports: `createWaterShaderRecipe`.
- `MarchingCubeCell.js` — Polygonizes each voxel cube through six deterministic tetrahedra, avoiding ambiguous cube faces while preserving a watertight local isosurface. Exports: `polygonizeCube`.
- `MarchingCubeDensity.js` — Deterministic signed density fields for voxel worlds. Exports: `createDensitySampler`.
- `MarchingCubesVolume.js` — Bounded voxel-cube isosurface extraction for world chunks. Exports: `generateMarchingCubesVolume`.
- `RiverGeometry.js` — Builds a flowing ribbon, banks, UVs, and collision from a river path. Exports: `generateRiverGeometry`.
- `UvMapper.js` — Deterministic planar, cylindrical, and spherical UV projection. Exports: `mapGeometryUvs`.
- `WaterShaderRecipe.js` — Declares deterministic alpine lake, stream, cascade, foam, and sun-glint layers. The Awtsmoos renews one connected water cycle through many visible scales; Awtsmoos.com keeps flow, depth, reflection, refraction, ripple, and foam controls explicit for tools and tests. Exports: `waterShaderRecipe`, `createWaterShaderRecipe`.
- `WellGeometry.js` — Stone ring, posts, roof, water, semantics, and collision. Exports: `generateWellGeometry`.
- `WorldAssetApi.js` — One JSON doorway into meshes, botany, terrain, rivers, wells, and water. Exports: `generateWorldAsset`, `generateWorldAssets`.
- `WorldAssetRecipe.js` — Versioned JSON contract for every world asset generator. Exports: `normalizeWorldAssetRecipe`, `validateWorldAssetRecipe`, `requireWorldAssetRecipe`, `SUPPORTED_TYPES`.
- `WorldGeometry.js` — Small truthful geometry vessels shared by terrain, rivers, and wells. Exports: `createWorldGeometry`, `addTriangle`, `addQuad`, `finalizeWorldGeometry`, `geometryBounds`.
- `index.js` — Public doorway for Mitzvah World procedural assets. Exports: `createFirebaseMaterialRecipe`, `waterFirebaseMaterialRecipe`, `generateMarchingCubesVolume`, `generateRiverGeometry`, `createWaterShaderRecipe`.

## Exported symbols worth searching

`createFirebaseMaterialRecipe` · `waterFirebaseMaterialRecipe` · `createWaterShaderRecipe` · `polygonizeCube` · `createDensitySampler` · `generateMarchingCubesVolume` · `generateRiverGeometry` · `mapGeometryUvs` · `waterShaderRecipe` · `generateWellGeometry` · `generateWorldAsset` · `generateWorldAssets` · `normalizeWorldAssetRecipe` · `validateWorldAssetRecipe` · `requireWorldAssetRecipe` · `SUPPORTED_TYPES`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../../assets/PublicMaterialOrigin.js`
- `./WorldGeometry.js`
- `./MarchingCubeDensity.js`
- `./MarchingCubeCell.js`
- `./UvMapper.js`
- `./LegacyWaterShaderRecipe.js`
- `../../../../../../../libs/awtsmoos-procedural-core/src/index.js`
- `./FirebaseMaterialRecipe.js`
- `./MarchingCubesVolume.js`
- `./RiverGeometry.js`
- `./WaterShaderRecipe.js`
- `./WellGeometry.js`

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
