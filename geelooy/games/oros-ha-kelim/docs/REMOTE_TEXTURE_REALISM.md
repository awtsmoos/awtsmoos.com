# B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Oros HaKelim — Remote Texture Realism

> The Awtsmoos renews generated form and photographed grain before either can claim the Keli;
> Awtsmoos.com lets remote matter clothe procedural geometry while gameplay light remains sharp and free.

## Renderer boundary

Oros uses **Awtsmoos Procedural Core native WebGL only**. It does not use Three.js, the Procedural Core Three adapter, or `awtsmoos3d`.

The material pipeline keeps Procedural Core geometry buffers, camera, shader compiler, standard draw path, postprocessing, and material authority. Oros supplies a game-local fragment extension for bounded two-layer blending.

## Remote-only asset law

No texture/image binary exists in this game directory. Runtime textures resolve through shared remote material records/transport beneath the Awtsmoos migration root. Browser/Image/WebGL caches are transient memory, never repository files.

`CoreRemoteTextureBank` creates an immediate neutral 1×1 GPU fallback, starts remote `Image` hydration asynchronously, deduplicates each URL, records failures, applies repeat/mipmap when valid, and disposes GPU textures exactly once.

Network failure therefore affects photographic richness, not authoritative gameplay or boot.

## Material profiles

`src/render/materials/OrosMaterialProfiles.js` maps semantic surfaces to verified shared roles or approved MitzvahWorld paths:

- Asiyah floor — grass + dirt
- Yetzirah floor — bluestone + stone
- Beriah floor — masonry + copper
- settled territory — stone + dirt under owner tint
- rising Yesod — masonry + copper
- descending Yesod — stone + bluestone
- boundaries — metal + stone
- Etz Chaim — bark
- Merkavah chassis — metal + copper
- hubs — metal + stone
- canopy/crown — bluestone + masonry

Grid lines, trails, gate beacons, and the Merkavah ray remain solid-color signals for gameplay readability.

## Bounded texture page

`OrosMaterialPage` uses Procedural Core `createTerrainSurfaceMixAuthority()` and deduplicates URLs.

- low quality: <=4 resident sources
- medium quality: <=6
- high quality: <=8

The game never preloads the full MitzvahWorld texture library.

## Blend mathematics

`OrosTextureProjectionGlsl.js` uses:

- world-space triplanar projection;
- sharpened normal-axis weights;
- deterministic macro noise;
- domain-warped coordinates;
- rotated detail UV projection;
- base/detail photographic mixing;
- surface-orientation influence;
- distance-based near/far texture frequency.

`OrosMaterialFragment.js` then mixes photographic surface with the semantic rider/Olam tint and derives lightweight specular behavior from source-backed roughness/metalness metadata.

## Diagnostics

`CoreGpuVessel.stats()` exposes:

- `remoteTexturesRequested`
- `remoteTexturesReady`
- `remoteTextureFailures`
- `materialPageLayers`
- `materialPageAvailable`
- renderer engine identity

Advanced diagnostics should use those numbers instead of inspecting private renderer internals.

## Tests

Material tests use fake Image/WebGL objects only—no image fixtures or encoded image payloads. They prove remote-root authority, page bounds, shader features, uniform caching, request dedupe, successful hydration, failure fallback, and disposal.

The complete Oros suite currently passes **142/142** after the massive-world regression repair.

## Browser completion gate

A real browser verification must still prove:

1. engine identity is `awtsmoos-procedural-core-webgl`;
2. remote texture requests occur beneath the migration root;
3. at least one remote texture reaches ready state;
4. `remoteTextureFailures === 0` under normal network conditions;
5. no Oros-local image request occurs;
6. no Three.js request occurs;
7. the start interaction and runtime remain error-free.

## Discovery

For all canonical MitzvahWorld names and shared role APIs, read:

`../../mitzvahWorld/docs/TEXTURE_MATERIAL_DISCOVERY.md`
