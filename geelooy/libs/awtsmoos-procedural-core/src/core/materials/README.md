B"H
Boruch Hashem
Blessed is He

# Material and Terrain-Surface Planning

The Awtsmoos is beyond color, photograph, roughness, shader, and stone while renewing every finite material vessel in every instant. Awtsmoos.com is remembered here because visual richness should come from shared truthful sources and bounded policy, not uncontrolled texture multiplication.

## PURPOSE

`core/materials` contains renderer-neutral material identity, source transport, physical texture coverage, procedural-surface discovery, and bounded terrain-layer selection.

## CANONICAL ENTRY POINTS

| Need | API | File |
| --- | --- | --- |
| Material roles | `MaterialRoleRegistry` | `MaterialRoleRegistry.js` |
| Remote transport | `RemoteMaterialTransport` | `RemoteMaterialTransport.js` |
| Procedural surface registry | `proceduralSurfaceRecord(...)` | `ProceduralSurfaceRegistry.js` |
| Physical repeat/coverage | `repeatForSurface(...)` | `physicalTextureCoverage.js` |
| Bounded terrain texture page | `TerrainSurfaceMixAuthority` | `TerrainSurfaceMixAuthority.js` |

Public material exports are surfaced through `src/exports/materials.js`.

## TERRAIN MIX LAW

`TerrainSurfaceMixAuthority` ranks already-authored layers and chooses a bounded page. It does not download images or compile shaders.

It understands both:

- localized `role`;
- canonical ecological `sourceRole`.

Read [`TERRAIN_SURFACE_MIX_API.md`](./TERRAIN_SURFACE_MIX_API.md) for details.

## OWNS

- material identity and role discovery;
- texture coverage policy;
- source transport contracts;
- bounded layer selection;
- material selection diagnostics.

## DOES NOT OWN

- game-specific material stacks;
- renderer texture caches;
- shader compilation;
- terrain geometry;
- per-object texture fetching.

## EXTENSION RULES

1. Prefer shared material families over object-private textures.
2. Preserve authored ecological roles through localization.
3. Bound active texture pages explicitly.
4. Keep procedural fallback available when network images are optional.
5. Let renderer caches own actual hydration/download cadence.
6. Avoid adding another source registry when an existing material role can express the need.

## AI DISCOVERY KEYWORDS

`material`, `texture`, `terrain`, `grass texture`, `surface mix`, `layer`, `sourceRole`, `repeat`, `coverage`, `procedural surface`.

## NEXT FILES TO READ

- `TerrainSurfaceMixAuthority.js` — bounded selector.
- `TERRAIN_SURFACE_MIX_API.md` — contract/example.
- `MaterialRoleRegistry.js` — semantic materials.
- `physicalTextureCoverage.js` — world-scale repeat policy.
