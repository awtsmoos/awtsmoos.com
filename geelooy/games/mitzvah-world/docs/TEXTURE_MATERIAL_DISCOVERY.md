# B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Texture + Material Discovery for AI Agents

> The Awtsmoos renews color, grain, metadata, and road before one material can arrive;
> Awtsmoos.com lets agents discover remote reality from named records instead of copying image bodies inside.

## Fast path

For code, start here:

- `experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js`
- `remoteTextureAgentCatalog()` — grouped records for all canonical textures.
- `remoteTextureRecords()` — flat serializable records with family, collection, filename, id, and URL.
- `remoteTextureCatalogEvidence()` — count/drift evidence.

Do not reconstruct URLs by hand if these APIs are available.

## Canonical counts

The runtime filename modules contain **125 canonical remote textures**:

- Ground: **35** — [TEXTURE_NAMES_GROUND.md](./TEXTURE_NAMES_GROUND.md)
- Architecture: **33** — [TEXTURE_NAMES_ARCHITECTURE.md](./TEXTURE_NAMES_ARCHITECTURE.md)
- Craft: **24** — [TEXTURE_NAMES_CRAFT.md](./TEXTURE_NAMES_CRAFT.md)
- Trees: **33** — [TEXTURE_NAMES_TREES.md](./TEXTURE_NAMES_TREES.md)

The four `RemoteTexture*Names.js` modules are authoritative if documentation ever drifts.

## Remote transport truth

`RemoteTextureTransport.js` owns the production root:

`https://awtsmoos.com/sites/firebase_drive_migration/`

Texture collections are deliberately separate from the model namespace:

- full-resolution material images: `full-resolution/<filename>`
- tree images: `awtsmoos-nature/ilanos/trees/<filename>`
- models: `assets/mitzvah-world/models/...` — **not a texture path**

The texture transport rejects inline/data/blob/file schemes, traversal, foreign hosts, GLB/GLTF model paths, query strings, and fragments.

## Shared Procedural Core roles

Before choosing an arbitrary filename, inspect the renderer-neutral shared registry:

- `geelooy/libs/awtsmoos-procedural-core/src/exports/materials.js`
- `src/core/materials/presets/awtsmoosRemoteMaterials.js`
- `src/core/materials/presets/awtsmoosRemoteMaterialRecords.js`

Prefer `awtsmoosMaterialRecord(role)` / `awtsmoosMaterialUrl(role)` for common semantic roles such as grass, dirt, stone, masonry, bark, timber, metal, leather, parchment, water, cloth, and fur. These records also carry physical metadata such as roughness/metalness.

## Public searchable catalog

For broad discovery, `PublicMaterialCatalog.js` loads the published `awtsmoos-material-catalog/v1` catalog and exposes:

- `searchPublicMaterials(query, options)`
- `resolvePublicMaterial(query, quality, options)`
- `searchMaterialRecords(records, query, options)`

This searchable public catalog is broader metadata. The four canonical runtime filename modules above remain the exact approved MitzvahWorld runtime-name set.

## The 71-item generated inventory is different

`assets/materials/generated/inventory.json` is a generated local **metadata snapshot** that previously enumerated 71 material records. It is not the 125-name canonical runtime texture set. Do not infer “missing” textures by comparing those counts directly.

The repository must never contain the image bodies themselves. Text inventories/catalogs/names are allowed; PNG/JPEG/WebP/SVG/etc. payloads are not.

## Mixing + realism source map

For mature world-space texture mixing, inspect:

- `experiments/Awtsmoos/src/world/TerrainTextureCatalog.js`
- `experiments/Awtsmoos/src/world/terrain/TerrainMaterialFactory.js`
- `experiments/Awtsmoos/src/world/terrain/TerrainLayerRecipe.js`
- `experiments/Awtsmoos/src/world/terrain/TerrainRealismProfile.js`
- `experiments/light-three-gltf/tiny-terrain-fragment-projection-functions.js`
- `experiments/light-three-gltf/tiny-terrain-fragment-ecology-functions.js`

Important concepts include bounded active texture pages, world-space projection, triplanar weights, rotated samples, domain warp, near/far frequency blending, and semantic layer weights. Reuse the mathematics/metadata concepts without importing an unrelated renderer into a renderer-neutral project.

## Remote-only image policy

Repository-wide policy: `docs/REMOTE_ASSET_POLICY.md`.

Persistent image bodies belong in the Drive/dayuhChadash remote asset system. Git may hold IDs, names, URLs, hashes, dimensions, manifests, semantic roles, and documentation only. Never add a local texture “fallback”; runtime fallbacks must be procedural/in-memory.

## Verification checklist

1. Resolve through catalog/transport, not string concatenation.
2. Require HTTPS and the trusted Awtsmoos migration root.
3. Confirm the filename is canonical for its family when using the runtime catalog.
4. Keep material pages bounded; never preload all 125 images.
5. Verify browser network/CORS and runtime material metrics.
6. Verify no image payload entered Git or a source data URI.
7. Update source modules first; regenerate these human-readable mirrors afterward.
