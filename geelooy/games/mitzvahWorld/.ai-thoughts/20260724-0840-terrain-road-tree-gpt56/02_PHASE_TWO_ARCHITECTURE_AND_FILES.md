# B"H
# Boruch Hashem
# Blessed is He

## Phase two: realistic architecture

### Texture-density vessel

`MinimalMeadowTextureDensity.js` will normalize surface dimensions, source dimensions, target pixels per world unit, renderer limits, anisotropy, and mobile quality. It will select independent integer X/Z repeats and return diagnostics. The result must stay close to the requested density without oversampling or global stretching.

### Road vessel

`MinimalMeadowCobblestoneTexture.js` will create one deterministic cached canvas with staggered stones, mortar, color variation, wear, and restrained dirt. `MinimalMeadowTerrainComposites.js` will use it for the path center while preserving dirt-grass shoulders.

### Tree vessels

`MinimalMeadowProceduralTreeGeometry.js` will import canonical `generateTreeProceduralData`, convert branch/leaf arrays to tiny-runtime `BufferGeometry`, and cache geometry by preset/detail. `MinimalMeadowTreeFactory.js` will instantiate two shared-geometry meshes per tree and apply actual bark/leaf materials. `MinimalMeadowTreeSystem.js` will choose bounded quality, share materials, hydrate leaves once, and report real core metadata. Placements remain deterministic and grounded.

### Existing file rewrites

- Terrain package: replace fixed repeats with density plans and diagnostics.
- Terrain composites: use cobblestone center and ecological shoulders.
- Texture composite: preserve source dimensions and cached deterministic composite creation.
- Tree factory: delete cylinder/card generation entirely.
- Tree system: consume canonical geometry and bound mobile population.
- Tree placements: accept explicit preset/population options while preserving exclusions.

### Verification

Focused tests, all touched-file syntax checks, import resolution, query-identity scan, tabs, hashes, focused browser desktop/mobile, console inspection, request count, and final handoff.
