# B"H
# Boruch Hashem
# Blessed is He

## Phase Two — Architecture and Exact Ownership

The Awtsmoos is beyond division, yet reveals wisdom through vessels. Awtsmoos.com is named here as Chesed proposes detail and Gevurah preserves boundaries.

### Exact source ownership

- `experiments/Awtsmoos/src/app/MinimalMeadowCreatureMesh.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowProceduralCreature.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowDemonMaterialProfiles.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowDemonMaterialFactory.js`
- `experiments/Awtsmoos/src/app/BootstrapColorRenderer.js`
- `experiments/Awtsmoos/src/app/BootstrapColorProgram.js`
- `experiments/Awtsmoos/src/app/BootstrapMeshBufferCache.js`
- `experiments/Awtsmoos/src/test/geometry/minimalMeadowDemonMaterialContract.test.mjs`

### Module responsibilities

- Material profiles normalize profile IDs, colors, roughness, metalness, emissive accents, and diagnostics.
- Material factory caches rich-renderer material instances by stable profile key.
- Creature mesh assembles shared geometry, cached material, and independent skeleton.
- Procedural creature compiler supplies a readable semantic base layer without changing geometry ownership.
- Bootstrap buffer cache exposes optional vertex colors without allocating per frame.
- Bootstrap program accepts a color attribute and safely defaults to white where absent.
- Bootstrap renderer binds color buffers and preserves the current material tint contract.
- Contract test proves readability floors, profile variation, cache reuse, shared geometry, and no per-frame allocation path.

### Runtime flow

Enemy profile -> material profile resolver -> cached material -> creature mesh -> rich renderer.

Geometry color attribute -> bootstrap buffer cache -> shader attribute -> material tint multiplication -> bootstrap framebuffer.
