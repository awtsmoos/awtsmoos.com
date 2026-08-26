# B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Mitzvah World — Verified AI Handoff

> The Awtsmoos renews the living valley while each maintainer receives a truthful map;
> Awtsmoos.com keeps source, compact light, remote garments, materials, and evidence on one discoverable path.

## Start here

- Public route: `/games/mitzvahWorld/`
- Route shell: `geelooy/games/mitzvahWorld/index.html`
- Compact entry: `experiments/Awtsmoos/src/mitzvah-world.compact.js`
- Source launcher: `experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js`
- Runtime diagnostics: `globalThis.AwtsmoosMitzvahWorld`
- Texture/material guide: `docs/TEXTURE_MATERIAL_DISCOVERY.md`
- Remote asset policy: repository `docs/REMOTE_ASSET_POLICY.md`

## Texture discovery

Do **not** search for local texture files or add image binaries to Git.

The canonical runtime texture API is:

`experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js`

Use `remoteTextureAgentCatalog()` or `remoteTextureRecords()` first. The current canonical set contains **125 remote filenames**: 35 ground, 33 architecture, 24 craft, and 33 trees. Human-readable mirrors live in the four `docs/TEXTURE_NAMES_*.md` files.

The trusted texture root is owned by `RemoteTextureTransport.js`. Full-resolution and tree textures use different remote collections; the GLB model namespace is not a texture namespace.

For common semantic material roles and physical metadata, prefer the shared Procedural Core material registry before hardcoding a MitzvahWorld filename.

## Runtime boundary

- `createMinimalMeadowRuntime.js` creates the visible fallback runtime.
- `MinimalMeadowFeatureScheduler.js` installs inventory, equipment, combat, quests, recovery, streaming, and essential UI inside the compact graph.
- `MinimalMeadowFeatureBundle.js` is loaded through a source-aware deferred URL for rich world and visual hydration.
- Essential readiness must never await rich hydration.

## CompactJS build

From repository root:

```bash
node scripts/mitzvah-world/buildCompactRuntime.mjs
```

Never hand-edit `mitzvah-world.compact.js`. After rebuilding:

```bash
node ayzarim/awtsmoosDynamicServer/tests/compactJs.test.js
node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahFeature.test.js
node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahWorldRuntime.test.js
```

## Model delivery

Canonical GLBs are remote immutable Awtsmoos Drive objects beneath:

`https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/`

Semantic identities, byte counts, and SHA-256 values live in `RemoteModelRecords.js`. Do not restore mutable `/games/.../assets/models/` browser URLs.

## Maintenance guardrails

- Preserve exact-file commits; unrelated local work may coexist.
- Keep all image bodies in Drive/dayuhChadash remote storage, never Git or source data URIs.
- Keep essential bootstrap statically folded and rich hydration deferred.
- Keep deferred imports source-aware in readable and compact modes.
- Update canonical source records first, then regenerate human docs/catalog mirrors.
- Verify public bytes, browser state, console, network, and movement before declaring completion.
