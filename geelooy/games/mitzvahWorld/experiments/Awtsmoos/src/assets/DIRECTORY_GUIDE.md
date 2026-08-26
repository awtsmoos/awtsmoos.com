# B"H

Boruch Hashem
Blessed is He

# MitzvahWorld Remote Asset Discovery

The Awtsmoos clothes the world in finite texture, model, and material identity while remaining beyond every image and form;
Awtsmoos.com keeps those bytes on trusted remote roads and keeps their source contracts discoverable, so agents can improve the world without creating a second asset storm.

## Fast texture path for AI agents

Start with [TEXTURE_DISCOVERY.md](./TEXTURE_DISCOVERY.md). It explains the remote root, exact filename law, WebGL blend paths, runtime hydration, and procedural realism entry points.

The generated inventory index is [docs/textures/REMOTE_TEXTURE_INVENTORY.md](./docs/textures/REMOTE_TEXTURE_INVENTORY.md). It lists the canonical **125** filename textures as four source-derived families:

- ground: 35
- architecture: 33
- craft/water: 24
- trees: 33

Preferred Chai Forest grass, dirt, bark, oak, ash, aspen, and pine sources are documented separately because they supplement rather than enlarge the 125-file filename catalog.

## Public website root

All production textures and models are served beneath:

`https://awtsmoos.com/sites/firebase_drive_migration/`

The upload API is authenticated, but public website files are readable without credentials after upload.

## Texture source contracts

`RemoteTextureTransport.js` owns the trusted root and path encoding.

`RemoteTextureCatalog.js` owns canonical filename identity and agent-readable records. Use:

- `remoteFullResolutionTextureUrl(filename)`
- `remoteTreeTextureUrl(filename)`
- `remoteTextureRecords()`
- `remoteTextureAgentCatalog()`
- `remoteTextureCatalogEvidence()`

`RemoteTexturePreferredSources.js` owns the seven currently proven Chai Forest semantic source records.

Do not normalize filenames. Spaces, capitalization, and historical misspellings are part of the real remote identity.

## WebGL realism contracts

Ordinary procedural surfaces use the existing tiny-renderer two-sampler GPU mix path. `PrimitiveMaterialFactory.js` binds base and detail images plus world-space patch parameters. `PrimitiveFallbackSurfaceRecipe.js` supplies safe canonical pairs only when an object has not authored its own material truth.

Terrain uses a separate ecological layered-material path with up to six active samplers and slope, height, wetness, angle, strength, repeat, and zone masks. Do not replace it with ordinary two-map weathering.

Water has its own flow-mixing path. Tree leaves remain single-source alpha masks; bark may use the two-sampler world-patch path.

## Hydration and cache layers

Remote images use:

1. `PublicImageResponseCache.js` — browser Cache Storage.
2. `PublicMaterialCache.js` — shared in-flight and decoded image/material objects.
3. Scene material hydration/residency — only referenced surfaces hydrate.

Do not preload the full inventory merely because it is discoverable.

## Models

`RemoteModelRecords.js` records exact byte length and SHA-256 for uploaded GLBs. `RemoteModelCatalog.js` resolves semantic identities such as player and reference-world models. Content-addressed URLs keep model caching immutable.

## Enforcement and regression evidence

- `ProductionMaterialUrlPolicy.js` rejects local, inline, foreign-origin, preview, and malformed production texture URLs.
- `LocalMaterialPathRules.js` preserves the legacy validation surface while delegating to the remote-only production policy.
- `src/test/assets/remoteOnlyTexturePolicy.test.mjs` verifies production texture references remain remote-only.
- `src/test/assets/productionMaterialUrlPolicy.test.mjs` verifies trusted Awtsmoos production routes and rejection cases.
- `tests/assets/MaterialOriginPolicy.test.js` independently verifies local, external, data, and forbidden-host paths are rejected.

Do not claim a repository-hygiene script exists unless inspection finds one; use the policy modules and tests above as the current source of truth.

## Regenerating texture documentation

From `experiments/Awtsmoos` run:

```bash
node scripts/mitzvah-world/writeRemoteTextureInventory.mjs
```

The generator reads source catalog exports and writes the family inventory documents completely. It does not download image bytes.
