# B"H

Boruch Hashem
Blessed is He

# Mitzvah World Runtime Assets

The Awtsmoos clothes the world in finite color while remaining beyond every image. Mitzvah World therefore keeps texture identity in source code, downloads image bytes from one documented Awtsmoos.com origin, and lets browser caches preserve those bytes without committing copies to Git.

## Texture origin

All production texture URLs must begin with:

`https://awtsmoos.com/sites/firebase_drive_migration/`

`RemoteTextureTransport.js` is the only module that owns this root. Callers provide canonical migration paths such as:

- `full-resolution/grass 1.png`
- `awtsmoos-nature/chai-forest/textures/ground/grass.jpg`
- `awtsmoos-nature/ilanos/trees/apple tree bark.png`

Paths are encoded segment by segment. Traversal, query strings, fragments, foreign origins, HTTP, `file:`, `blob:`, `data:`, repository-relative texture paths, preview folders, and reduced production folders are rejected.

## Cache layers

Remote image loading uses two cache layers:

1. `PublicImageResponseCache.js` stores verified image responses in browser Cache Storage under `awtsmoos-mitzvah-world-remote-images-v1`.
2. `PublicMaterialCache.js` shares in-flight promises and decoded image/material objects in memory.

When Cache Storage is unavailable, the loader still uses normal browser HTTP caching with `fetch(..., { cache: 'force-cache' })`.

## Catalog and policy modules

- `RemoteTextureCatalog.js` names the verified remote texture catalog.
- `PublicMaterialOrigin.js` resolves catalog and material paths through the remote root.
- `PhotographicMaterialAssetPolicy.js` maps declared canonical identities to remote URLs.
- `ProductionMaterialUrlPolicy.js` enforces remote-only production textures.
- `PublicMaterialResolver.js` separates texture resolution from the temporary local model exception.
- `scripts/mitzvah-world/checkRemoteOnlyTextures.mjs` scans production literals and rejects copied or inline media paths.

## Model exception

GLB models under `geelooy/games/mitzvahWorld/assets/models/` remain local for now. The proposed migration path for `Flower_4_Clump.glb` returned HTTP 404 during this migration, so no remote model URL was invented. Models are not texture fallbacks and remain outside texture policy.

## Repository boundary

Git must not contain Mitzvah World texture images, rendered movies, or visual-reference screenshots. The repository hygiene policy approves only the explicit model root. JSON and text movie-project source may remain.

## Verification

Run:

```bash
node scripts/mitzvah-world/checkRemoteOnlyTextures.mjs
node --test geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/assets/*.test.mjs
npm run repo:hygiene
```
