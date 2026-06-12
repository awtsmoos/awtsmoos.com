B'H
# Phase Two — Concrete Shader RAM Texture Architecture

What must be true at the end:
- Runtime does not need the generated PNGs for village visual materials.
- Every material used by realistic interiors/exterior clutter can get a RAM-created THREE.DataTexture.
- The algorithms are JS shader-style functions: `shadeMaterial(kind, uv, channel)` and `heightMaterial(kind, uv)`.
- Textures are static once generated and cached in RAM.
- Initial/postbuild warms the cache so the first viewed cottage does not pop from flat fallback to detailed texture.
- A JS preview script exists to export PNG previews if desired, but runtime does not depend on PNGs.

Design:
1. `ProceduralShaderTextureLibrary.js`
   - imports THREE only.
   - material aliases map old keys (`wood`, `darkWood`) to shader material kinds (`weathered_wood`, `dark_beam_wood`).
   - `shaderTexture(kind, channel, options)` returns DataTexture.
   - `shaderMaterial(kind, options)` returns MeshStandardMaterial or Lambert fallback.
   - `warmVillageShaderTextures(options)` generates all material/channel combinations in chunks.
   - `getVillageShaderTextureStats()` returns cache counts.
2. Algorithms:
   - `hash21`, `valueNoise`, `fbm`, `warp`, `voronoi`, `stripe`, `smoothstep`, `paletteMix`.
   - `heightAt(kind, u, v, seed)` per material.
   - `albedoAt(kind, u, v, seed)` per material.
   - normal uses height derivative around uv with wrap.
   - roughness uses material + height + noise.
   - AO uses crevice/mortar/streak masks.
3. Channels:
   - `albedo`, `normal`, `roughness`, `height`, `ao`.
   - For speed/performance material, only map is required; normal/roughness generated but not always used by material.
4. Size strategy:
   - default 256.
   - options.size supported.
   - if quality speed, maybe 128 from settings, but for the user's request default to 256 and allow 512.
5. Cache key includes `kind`, `channel`, `size`, `seed`.
6. DataTexture format:
   - albedo/normal/roughness/ao all RGBA Uint8.
   - RepeatWrapping, sRGB for albedo only.
7. Runtime worker-safe:
   - no document.
   - no canvas.
   - no image/loader.
   - no ImageBitmap.
8. Material mode:
   - `mobileFast` option uses MeshLambertMaterial with albedo only.
   - default uses MeshStandardMaterial with map, normalMap, roughnessMap, aoMap maybe; but AO needs uv2, not reliable. So set roughnessMap/normalMap and basic roughness.
9. Existing `rvMaterial` can call `shaderVillageMaterial`.
10. Existing `rvMesh` and interiors stay mostly unchanged.
11. Postbuild `MitzvahWorldPostBuild.js` warms textures before/after visual layer.
12. `VillageVisualRealityLayer` stays unchanged except cache bust if needed.
13. `RealisticVillageMaterials.js` rewritten to remove PNG URL logic.
14. Preview script:
   - `tools/generateVillageShaderTexturePreviews.mjs` self-contained.
   - writes to `assets/textures/realisticVillageShaderPreviews`.
   - creates the same 13 kinds * 5 channels if run.

Risk fixes:
- MeshStandardMaterial with normal maps on many tiny props might cost Android. But tiny prop count is moderate. To be safe, add `options.simple` and default from `globalThis.__AWTSMOOS_MOBILE_SETTINGS__?.quality === 'speed'` when available. In worker, global settings may not exist. Default `standard` for extreme quality as requested.
- Generating all channels synchronously can stall startup. The warm function will yield with `await Promise.resolve()` or setTimeout every few textures.
- If postbuild awaits warm before scene, player waits. Better warm first core albedo/normal synchronously? User said initial loader; implement await warm but chunked. For only 13*3*256, manageable.

Awtsmoos chapter:
The architecture is a hidden mikdash of pixels. Each material is not an image file; it is a law. Wood law, stone law, mud law, grass law. When a table asks for wood, the law condenses into RAM and is remembered.