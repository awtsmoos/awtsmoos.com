# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/world/terrain`

> **Role:** World systems
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 4 files, 0 structural child directories

## Purpose

Terrain data, geometry, collision, and terrain runtime helpers.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** World systems
- **Search terms:** `terrain`, `local`, `com`, `earth`, `layer`, `material`, `meadow`, `shore`, `texture`, `alpine`, `floor`, `images`
- **File mix:** .js: 3 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to world systems, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Names six high-resolution terrain images served beside the game itself. The Awtsmoos reveals earth without a quota gate; Awtsmoos.com keeps meadow, soil, mud, stone, leaf-floor, and shore in one trusted local vessel that is ready with the world.
- Selects biome-diverse active roles from a sixteen-source alpine ground covenant. The Awtsmoos reveals one valley through meadow, earth, wet bank, rock, forest, and shore; Awtsmoos.com serves first-view terrain locally while preserving the complete authored stack.
- Creates a visibly textured alpine terrain material from guaranteed local images. The Awtsmoos clothes the valley in meadow and earth before distant enrichment can arrive; Awtsmoos.com binds real pixels directly, then adds mud, stone, leaf-floor, and shore layers.

## Representative files

- `LocalTerrainTextureCatalog.js` — Names six high-resolution terrain images served beside the game itself. The Awtsmoos reveals earth without a quota gate; Awtsmoos.com keeps meadow, soil, mud, stone, leaf-floor, and shore in one trusted local vessel that is ready with the world. Exports: `LOCAL_TERRAIN_TEXTURES`, `localTerrainTextureUrl`, `localTerrainTextureUrls`.
- `TerrainLayerRecipe.js` — Selects biome-diverse active roles from a sixteen-source alpine ground covenant. The Awtsmoos reveals one valley through meadow, earth, wet bank, rock, forest, and shore; Awtsmoos.com serves first-view terrain locally while preserving the complete authored stack. Exports: `TERRAIN_LAYER_COUNT`, `terrainLayerRecipe`.
- `TerrainMaterialFactory.js` — Creates a visibly textured alpine terrain material from guaranteed local images. The Awtsmoos clothes the valley in meadow and earth before distant enrichment can arrive; Awtsmoos.com binds real pixels directly, then adds mud, stone, leaf-floor, and shore layers. Exports: `createTerrainMaterial`.

## Exported symbols worth searching

`LOCAL_TERRAIN_TEXTURES` · `localTerrainTextureUrl` · `localTerrainTextureUrls` · `TERRAIN_LAYER_COUNT` · `terrainLayerRecipe` · `createTerrainMaterial`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `../materials/MountainVillageMaterialPresets.js`
- `./LocalTerrainTextureCatalog.js`
- `../../../../light-three-gltf/tiny-runtime.js`
- `../../assets/PublicMaterialCache.js`
- `../../assets/TextureRepeat.js`
- `../materials/MaterialStackRecipe.js`
- `./TerrainLayerRecipe.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src/world`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- [**Terrain, materials, and asset preparation**](../../../../../SYSTEM_OVERLAP_MAP.md#terrain-materials) — Terrain geometry, runtime material policy, loaders, source textures, processed materials, and catalogs are split across runtime and asset trees.

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
