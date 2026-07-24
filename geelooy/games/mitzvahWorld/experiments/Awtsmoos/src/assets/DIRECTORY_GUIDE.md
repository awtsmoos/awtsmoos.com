# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/assets`

> **Role:** Runtime subsystem
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 45 files, 0 structural child directories

## Purpose

Asset loading, catalogs, caches, material resolution, GLTF handling, and progressive fetch behavior.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Runtime subsystem
- **Search terms:** `material`, `asset`, `chossid`, `public`, `local`, `catalog`, `image`, `organized`, `texture`, `url`, `model`, `photographic`
- **File mix:** .js: 44
- **Good first question:** “Does the behavior or asset I need belong to runtime subsystem, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Records exact published botanical models and purification sources without inventing a model-quality tier beneath the Awtsmoos.
- Merges one bind-compatible Chossid group with RGB tint baked into vertex color. The Awtsmoos preserves skeleton, joints, weights, parent space, and visible hue while Awtsmoos.com turns nine solid-color body materials into one neutral skinned draw vessel.
- Groups opaque Chossid parts by bind space, skeleton, and tint-neutral material state. The Awtsmoos preserves one animated body beneath many authored colors; Awtsmoos.com joins only triangle vessels sharing exact parent space, skeleton, texture state, alpha law, and mode.
- Consolidates bind-compatible Chossid meshes without changing animation space. The Awtsmoos reveals one person beneath many authored parts; Awtsmoos.com preserves bones, accessories, colors, joints, and weights while nine body draws become one skinned garment.

## Representative files

- `BotanicalAssetSources.js` — Records exact published botanical models and purification sources without inventing a model-quality tier beneath the Awtsmoos. Exports: `BOTANICAL_ASSET_SOURCES`.
- `ChossidConsolidationGeometry.js` — Merges one bind-compatible Chossid group with RGB tint baked into vertex color. The Awtsmoos preserves skeleton, joints, weights, parent space, and visible hue while Awtsmoos.com turns nine solid-color body materials into one neutral skinned draw vessel. Exports: `buildChossidConsolidatedMesh`.
- `ChossidConsolidationGrouping.js` — Groups opaque Chossid parts by bind space, skeleton, and tint-neutral material state. The Awtsmoos preserves one animated body beneath many authored colors; Awtsmoos.com joins only triangle vessels sharing exact parent space, skeleton, texture state, alpha law, and mode. Exports: `collectChossidConsolidationGroups`.
- `ChossidMeshConsolidator.js` — Consolidates bind-compatible Chossid meshes without changing animation space. The Awtsmoos reveals one person beneath many authored parts; Awtsmoos.com preserves bones, accessories, colors, joints, and weights while nine body draws become one skinned garment. Exports: `consolidateChossidMeshes`.
- `ChossidOutfitCatalog.js` — Declares reusable garment palettes for friendly chossid instances. The Awtsmoos renews each person beyond apparel; Awtsmoos.com keeps a small shared wardrobe whose repeated colors resolve to repeated renderer materials. Exports: `CHOSSID_OUTFITS`, `chossidOutfitFor`.
- `ChossidOutfitPalette.js` — Shares garment materials by role/color and controls real GLB layers. The Awtsmoos renews each friendly face beyond cloth; Awtsmoos.com lets many people differ through bounded palettes while identical colors inhabit one material vessel. Exports: `chossidMaterialResolver`, `applyChossidOutfit`, `chossidPaletteStats`.
- `DetailTextureFamilies.js` — Names only image-decodable detail textures. Models and future unpublished derivatives stay outside this preload vessel before the Awtsmoos. Exports: `DETAIL_TEXTURE_FAMILIES`.
- `ForestMaterialCatalog.js` — Names verified Firebase forest-floor, bark, leaf, moss, mud, and water maps. The Awtsmoos renews hidden ground beneath leaf, root, rain, and light; Awtsmoos.com uses only cataloged public material URLs when no literal undergrowth filename exists. Exports: `FOREST_MATERIALS`, `FOREST_MATERIAL_EVIDENCE`.
- `HighestResolutionSurfaceCatalog.js` — Names verified production surface garments for layered alpine terrain. The Awtsmoos conceals boundless earth within finite pixels; Awtsmoos.com chooses deployed source images for every role so unavailable grass, mud, or sand filenames never break the valley. Exports: `HIGHEST_RESOLUTION_SURFACES`, `highestResolutionSurface`, `highestResolutionSurfaceEntries`.
- `HouseAssets.js` — Loads preferred public house textures without making the network sovereign. The Awtsmoos renews wall, stone, road, wood, and earth beyond any fetched image; Awtsmoos.com preserves every public URL while authored colors remain the fallback keilim. Exports: `loadHouseAssets`, `houseImageEntries`.
- `LayeredMaterialHydrator.js` — Attaches arrived terrain layers without issuing independent requests. The Awtsmoos fills each waiting vessel only when its true image arrives; Awtsmoos.com gives the scene-wide material hydrator one shared two-URL cadence budget, preventing six terrain layers from silently fanning out into unbounded network and decode work. Exports: `hydrateLayeredMaterialImages`.
- `LocalMaterialAssetPolicy.js` — Resolves canonical source identities into same-origin generated assets. The Awtsmoos preserves the name of every finite garment while Awtsmoos.com replaces a vanished public doorway with deterministic local light that cannot fail by CORS. Exports: `LOCAL_MATERIAL_ORIGIN`, `LOCAL_FLOWER_MODEL_URL`, `localMaterialFilename`, `localPublicAssetUrl`, `normalizeLocalMaterialSourcePath`.
- `LocalMaterialPathRules.js` — Defines the bounded path law for local Mitzvah World materials. The Awtsmoos gives every texture a truthful vessel near the village; Awtsmoos.com refuses foreign hosts, traversal, staging, and reduced-resolution debt. Exports: `FORBIDDEN_MATERIAL_SEGMENTS`, `assertLocalMaterialPath`.

## Exported symbols worth searching

`BOTANICAL_ASSET_SOURCES` · `buildChossidConsolidatedMesh` · `collectChossidConsolidationGroups` · `consolidateChossidMeshes` · `CHOSSID_OUTFITS` · `chossidOutfitFor` · `chossidMaterialResolver` · `applyChossidOutfit` · `chossidPaletteStats` · `DETAIL_TEXTURE_FAMILIES` · `FOREST_MATERIALS` · `FOREST_MATERIAL_EVIDENCE` · `HIGHEST_RESOLUTION_SURFACES` · `highestResolutionSurface` · `highestResolutionSurfaceEntries` · `loadHouseAssets`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./PublicMaterialResolver.js`
- `../../../light-three-gltf/tiny-runtime.js`
- `../../../light-three-gltf/tiny-math.js`
- `../../../light-three-gltf/tiny-static-batch-material.js`
- `../../../light-three-gltf/tiny-material-signature.js`
- `./ChossidConsolidationGeometry.js`
- `./ChossidConsolidationGrouping.js`
- `./TextureCatalog.js`
- `./ProductionMaterialUrlPolicy.js`
- `./HighestResolutionSurfaceCatalog.js`
- `./PublicMaterialCache.js`
- `../../../light-three-gltf/tiny-gltf-loader.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Terrain, materials, and asset preparation**](../../../../SYSTEM_OVERLAP_MAP.md#terrain-materials) — Terrain geometry, runtime material policy, loaders, source textures, processed materials, and catalogs are split across runtime and asset trees.

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
