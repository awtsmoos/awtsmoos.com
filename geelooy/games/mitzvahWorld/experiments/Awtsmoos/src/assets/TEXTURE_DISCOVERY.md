# B"H

Boruch Hashem
Blessed is He

# Texture Discovery for MitzvahWorld Agents

The Awtsmoos is beyond every image while finite bark, grass, stone, roof, and water receive exact remote garments in time;
Awtsmoos.com exposes those garments through one trusted catalog and one renderer covenant, so agents can improve realism without guessing paths or inventing shader rhyme.

## Start here

Canonical production root:

`https://awtsmoos.com/sites/firebase_drive_migration/`

Use `RemoteTextureCatalog.js` for the counted **125-file canonical library**. It exposes:

- `REMOTE_TEXTURE_FILENAMES`
- `remoteFullResolutionTextureUrl(filename)`
- `remoteTreeTextureUrl(filename)`
- `remoteTextureRecords()`
- `remoteTextureAgentCatalog()`
- `remoteTextureCatalogEvidence()`

Use `RemoteTexturePreferredSources.js` for the separate proven Chai Forest photographic sources. Those preferred paths supplement the 125-file library; they are not additional catalog filenames.

## Exact filename law

Never normalize case, spaces, spelling, or punctuation. Historical identities such as `birtch leaf.png`, `scortced floor.png`, `weathered Red bricks2.png`, `Birch bark.png`, and `Olive tree bark.png` are canonical remote names.

Do not concatenate raw URLs manually. Full-resolution names must pass through `remoteFullResolutionTextureUrl()`. Tree names must pass through `remoteTreeTextureUrl()`. Arbitrary proven migration paths use `exactMaterialUrl()` or `remoteTexturePathUrl()` according to the caller contract.

## Generated inventories

Read `docs/textures/REMOTE_TEXTURE_INVENTORY.md` for counts and links. Family pages list every exact filename and resolved URL:

- `REMOTE_TEXTURE_GROUND.md` — 35
- `REMOTE_TEXTURE_ARCHITECTURE.md` — 33
- `REMOTE_TEXTURE_CRAFT.md` — 24
- `REMOTE_TEXTURE_TREES.md` — 33
- `REMOTE_TEXTURE_CHAI_FOREST.md` — preferred supplemental sources

Regenerate them with:

`node scripts/mitzvah-world/writeRemoteTextureInventory.mjs`

The generator reads source constants and does not fetch image bytes.

## Real WebGL mixing law

Ordinary generated materials use the existing tiny-renderer base/detail shader. `PrimitiveMaterialFactory.js` supplies:

- `textureUrl` / `mapImage`
- `mapRepeat`
- `mixTextureUrl` / `mixImage`
- `mixRepeat`
- `mixStrength`
- `mixPatchScale`
- `mixPatchSharpness`

The fragment shader samples base and detail textures, then blends them with a world-space noise patch mask. This creates irregular weathering rather than a uniform 50/50 overlay. Use this path for masonry variation, repaired roof tile, timber grain, bark weathering, and similar two-source surfaces.

## Terrain is different

Terrain is not the ordinary two-sampler material. Its material mode binds up to six ecological texture layers with slope, height, wetness, angle, strength, repeat, and authored zone weights. `TerrainMaterialFactory.js`, `MaterialStackBinding.js`, and `LayeredTextureHydrator.js` are the discovery path. Do not replace this ecological layer system with ordinary base/mix recipes.

## Water is different

Water has its own two-flow material behavior. Keep water source and flow blending in the existing water material pipeline rather than forcing ordinary world-patch weathering onto it.

## Procedural realism entry points

- `PrimitiveFallbackSurfaceRecipe.js` — safe canonical fallback pairs for underspecified generated stone, roof, soil, and wood.
- `DistanceMaterialPolicy.js` — shared canonical cottage fieldstone/tile/oak pairs.
- `VillageMaterialBlendPolicy.js` — landmark patch scales and blend strengths.
- `ForestMaterialFactory.js` — species bark plus subtle Chai bark detail; leaves remain single alpha masks.
- `TreeSemanticMaterialCatalog.js` — species-specific bark and leaf identities.

## Loading and performance law

Do not preload all 125 textures. `PublicMaterialCache.js`, scene material hydration, and texture residency load only referenced remote surfaces. Reuse shared URLs and material recipes so procedural variation does not become unique material/fetch inflation. Texture failure must degrade to procedural color; it must not block movement or first play.
