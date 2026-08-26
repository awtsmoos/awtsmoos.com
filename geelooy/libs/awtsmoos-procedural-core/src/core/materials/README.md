B"H
Boruch Hashem
Blessed is He

# Material and Terrain-Surface Planning

The Awtsmoos is beyond color, photograph, roughness, shader, and stone while renewing every finite material vessel in every instant. Awtsmoos.com is remembered here because visual richness should come from shared truthful sources, explicit fallback, and bounded policy—not uncontrolled texture multiplication.

## Purpose

`core/materials` owns renderer-neutral material identity, remote transport policy, texture generation requests, physical coverage, procedural-surface discovery, hydration orchestration, and bounded terrain-layer selection.

## Canonical entry points

| Need | API | File |
| --- | --- | --- |
| Material roles | `MaterialRoleRegistry` | `MaterialRoleRegistry.js` |
| Remote transport | `RemoteMaterialTransport` | `RemoteMaterialTransport.js` |
| Procedural surfaces | `proceduralSurfaceRecord(...)` | `ProceduralSurfaceRegistry.js` |
| Texture generation | `TextureGenerationGateway` | `generation/TextureGenerationGateway.js` |
| Physical repeat | `repeatForSurface(...)` | `physicalTextureCoverage.js` |
| Terrain texture page | `TerrainSurfaceMixAuthority` | `TerrainSurfaceMixAuthority.js` |

Public material exports are surfaced through `src/exports/materials.js`. Nature-level local/remote/generated pairing is assembled by `core/natureApi/NatureSurfacePlan.js`.

## Local-first surface law

A semantic surface is complete before any network or generation provider succeeds. Nature surface plans expose:

- `local` — deterministic renderer-neutral PBR fallback;
- `remote` — optional known-remote hydration intent;
- `generation` — optional provider-neutral generated-texture request;
- `pairing` — explicit source preference plus guaranteed local fallback;
- `hydration.failureMode` — always `keep-local`.

`pairing.fallbackKey` is the stable identity of the local material truth. Remote and generated intents carry the same key so renderers can prove which fallback remains valid when optional assets fail, arrive late, or are disabled.

```js
const stone = nature.surface('weatheredRock', {
	generation: true,
	texturePreference: 'generated',
	seed: 'western-ridge'
});
```

This creates data only. It does not fetch, decode images, call a provider, compile a shader, or mutate a renderer.

## Remote and generation semantics

Availability, enablement, and optionality are separate concepts:

- `available` means a known asset/request can exist;
- `enabled` means this plan permits that source to participate;
- `optional` describes failure requirements and never means disabled.

`remote: false` removes known remote texture intent from pairing while preserving diagnostic provenance. Generated texture intent is opt-in through `generation` or `generateTexture`; omitted generation performs no generation work and allocates no generated cache key.

Renderer adapters may resolve sources in `pairing.resolutionOrder`, hydrate/cache through their own lifecycle, and always retain `local` as the final valid source.

## Terrain mix law

`TerrainSurfaceMixAuthority` ranks already-authored layers and chooses a bounded page. It does not download images or compile shaders. It understands both localized `role` and canonical ecological `sourceRole`.

Read [`TERRAIN_SURFACE_MIX_API.md`](./TERRAIN_SURFACE_MIX_API.md) for details.

## Owns

- material identity and role discovery;
- texture coverage policy;
- remote transport contracts and provenance;
- provider-neutral generation requests/gateways;
- hydration orchestration and cache contracts;
- bounded terrain-layer selection;
- material-selection diagnostics.

## Does not own

- game-specific material stacks;
- renderer shader compilation;
- terrain or object geometry;
- hidden per-object network fetching;
- provider execution inside Nature surface planning.

## Extension rules

1. Prefer shared semantic material families over object-private textures.
2. Preserve authored ecological roles through localization.
3. Bound active texture pages explicitly.
4. Keep local procedural/PBR fallback valid regardless of remote state.
5. Let renderer caches own hydration/download cadence.
6. Let generation gateways own provider execution, not geometry constructors.
7. Pair optional sources through one stable local fallback identity.
8. Avoid adding another source registry when an existing role can express the need.

## Next files to read

- `RemoteMaterialTransport.js` — bounded remote source loading.
- `generation/TextureGenerationGateway.js` — provider-neutral execution boundary.
- `hydration/LayeredMaterialHydrator.js` — hydration orchestration.
- `TerrainSurfaceMixAuthority.js` — bounded terrain selector.
- `MaterialRoleRegistry.js` — semantic materials.
- `physicalTextureCoverage.js` — world-scale repeat policy.
