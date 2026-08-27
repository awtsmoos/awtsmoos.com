# B"H

Boruch Hashem
Blessed is He

# Mitzvah World Remote Runtime Assets

The Awtsmoos clothes the world in finite color and form while remaining beyond every image and model. Mitzvah World therefore keeps asset identity, hashes, dimensions, roles, and cache policy in source code while all runtime bytes live in the authenticated Awtsmoos Drive alias `firebase_drive_migration`.

## Public website root

All production textures and models are served beneath:

`https://awtsmoos.com/sites/firebase_drive_migration/`

The upload API is authenticated, but public website files are readable without credentials after upload.

## Textures

`RemoteTextureTransport.js` owns the texture root. Callers provide canonical Drive paths such as:

- `full-resolution/grass 1.png`
- `awtsmoos-nature/chai-forest/textures/ground/grass.jpg`
- `awtsmoos-nature/ilanos/trees/apple tree bark.png`

Texture paths are encoded segment by segment. Traversal, query strings, fragments, foreign origins, HTTP, `file:`, `blob:`, `data:`, repository-relative paths, preview folders, reduced production folders, and model paths are rejected.

## Models

`RemoteModelRecords.js` records the exact byte length and SHA-256 of every uploaded GLB. `RemoteModelCatalog.js` resolves semantic identities such as:

- `player/chossid.glb`
- `reference-world/Flower_4_Clump.glb`
- `reference-world/Snake.glb`

Each Drive URL contains the full SHA-256:

`assets/mitzvah-world/models/<family>/<sha256>/<filename>.glb`

Because changing bytes creates a new URL, these models use public visibility and immutable caching. Nineteen GLBs totaling 4,752,884 bytes were uploaded and verified through both the raw public endpoint and the live website endpoint before local copies were removed.

## Cache layers

Remote image loading uses:

1. `PublicImageResponseCache.js` — browser Cache Storage under `awtsmoos-mitzvah-world-remote-images-v1`.
2. `PublicMaterialCache.js` — shared in-flight promises and decoded image/material objects.

Remote model loading uses:

1. `RemoteModelResponseCache.js` — browser Cache Storage under `awtsmoos-mitzvah-world-remote-models-v1`.
2. `ModelAssetLoader.js` — shared parsed GLB templates and isolated runtime instances.
3. A temporary in-memory Blob URL only while the lightweight GLB parser consumes already verified remote bytes.

No persistent inline, Blob, file, or repository fallback is allowed.

## Enforcement

- `ProductionMaterialUrlPolicy.js` accepts trusted remote textures only.
- `RemoteModelCatalog.js` accepts recorded content-addressed Drive GLBs only.
- `scripts/mitzvah-world/checkRemoteOnlyTextures.mjs` scans production string literals for local, inline, foreign, or copied runtime media.
- Repository hygiene rejects all Mitzvah World images, audio, video, documents, GLB, and GLTF files.
- `.gitignore` excludes the entire Mitzvah World runtime asset directory.

## Verification

Run:

```bash
node scripts/mitzvah-world/checkRemoteOnlyTextures.mjs
node --test geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/assets/*.test.mjs
node scripts/repository-hygiene/check.cjs
```

The Drive upload credential is provisioned only for the upload transaction, held in process memory, and revoked before non-secret evidence is emitted. Credentials must never enter source, logs, plans, browser bundles, or Git history.
