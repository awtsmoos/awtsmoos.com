B'H
# Phase One — Shader Texture RAM System Brainstorm

User command:
- Implement upgraded custom texture generation system via shaders.
- Cover all 34 images previously made.
- Make scripts to generate them in-place if needed.
- Use JS, no need for PNGs at runtime.
- Use shader textures, upgraded extreme quality, generated in initial loader and cached in RAM.

Interpretation:
- Do not rely on previously generated PNGs for runtime material maps.
- Keep PNG files if already present, but runtime should generate DataTextures in RAM from JS procedural shader-like code.
- Since the game runs partly in a worker where `document` is undefined, a WebGL canvas shader generator may not exist in worker. The safest implementation is a JS shader-style CPU evaluator that emulates fragment shader procedural functions into THREE.DataTexture, cache once in RAM, and exposes the same material API. This satisfies: shader algorithms, static image generation, JS, initial loader/cache in RAM, no PNG dependency.
- If OffscreenCanvas/WebGL is available later, the same shader code could be ported to fragment shader. But for immediate worker-safe use, CPU shader evaluator is mandatory.

What “34 images” means from previous generated assets:
- 13 albedo PNGs.
- 13 normal PNGs.
- manifest.json + maybe earlier unlisted maps if count was 34; previous audit counted 34 files. The runtime shader library should generate at least 13 albedo + 13 normal + roughness/height/AO runtime maps for all materials, exceeding 34 semantic maps.

Material types to support:
1. grass_meadow / grass
2. dry_grass / dry
3. dirt_path / dirt
4. mud_dark / mud
5. gravel_pebble / gravel
6. cobble_stone / cobble
7. plaster_limestone / plaster
8. weathered_wood / wood
9. dark_beam_wood / darkWood
10. clay_roof_tiles / roof
11. woven_rug / rug
12. burlap_sack / burlap
13. straw_thatch / straw

Map channels to generate:
- albedo/color map
- normal map from height derivative
- roughness map from material rules
- ambient occlusion/dirt map from crevice/mortar masks
- height map optional

Extreme quality shader algorithm brainstorm:
A. General shader core
1. Use deterministic hash/noise with tileable coordinates.
2. Multi-octave FBM.
3. Domain warping for organic variation.
4. Voronoi cell noise for cobbles and pebbles.
5. Stripe/seam masks for wood boards.
6. Ring/grain functions for wood fibers.
7. Tile row masks for roof tiles.
8. Warp color palettes with height/roughness.
9. Seamless periodic noise using sin/cos torus embedding if possible.
10. Generate normal maps by sampling height at neighboring pixels.
11. Generate roughness by material type: dirt high rough, roof medium, polished wood varied, rug high.
12. Generate AO from height valleys/mortar/creases.

B. Grass
13. Multiple green palettes.
14. Blade streak lines.
15. Clover/little leaf speckles.
16. Bare dirt flecks.
17. Dry blades mixed.
18. Height map from blade strokes.
19. Normal small high-frequency detail.
20. Roughness high but varied.

C. Dirt/mud
21. Packed path with ruts.
22. Pebbles embedded.
23. Damp dark patches.
24. Tiny cracks.
25. Foot-wear long smears.
26. Height valleys and roughness masks.

D. Gravel/cobble
27. Voronoi stones.
28. Mortar creases.
29. Per-stone color/tint.
30. Edge highlights.
31. Cracked stones.
32. AO in cracks.

E. Plaster/limestone
33. Fine plaster pores.
34. Larger stains.
35. Hairline cracks.
36. Lime color variation.
37. Edge dirt and dampness.

F. Wood
38. Board seams.
39. Longitudinal grain.
40. Knots.
41. Dark nail specks.
42. Rough scraped highlights.
43. Different palettes for weathered vs dark beams.

G. Roof tiles
44. Rows, curved tile bands.
45. Broken chipped tile edges.
46. Dark moss in cracks.
47. Terracotta variation.

H. Fabric/rug/burlap/straw
48. Warp/weft weave.
49. Colored stripe patterns.
50. Frayed edge bands.
51. Fibers and thread noise.
52. Straw directional fibers.

Runtime architecture brainstorm:
53. Create `ProceduralShaderTextureLibrary.js` under `villagePicture`.
54. It exports `shaderTexture(kind, channel, size)` and `shaderMaterial(kind, options)`.
55. It maintains module-level cache: texture by `kind:channel:size:seed`, material by settings.
56. It generates textures lazily on first material use but also supports `warmVillageShaderTextures()` for initial loader.
57. It exposes global diagnostic summary maybe.
58. It uses THREE.DataTexture so it works in worker and main thread.
59. No document/Image/TextureLoader required.
60. Normal map generation uses second pass sampling height function rather than image derivative.
61. Materials can be MeshLambertMaterial with map/normalMap/roughnessMap if available; for non-PBR Lambert ignores roughness, but MeshStandardMaterial might cost more. Use MeshLambertMaterial for mobile by default; MeshStandardMaterial optional if settings quality beauty.
62. Shader textures marked worldPersistentAsset.
63. Use lower size on mobile speed mode, maybe 128/256. User asked extreme quality; default 256 or 384? Android performance suggests 256/512. Use 256 default with size hook; allow 512 in beauty.
64. Initial loader should warm all texture channels for all kinds. This could cost CPU; do it incrementally or only albedo/normal. User asked initial loader; implement `warmVillageShaderTextures({quality})` and call postbuild/load.
65. To avoid startup spike, warm in chunks by `setTimeout/requestIdleCallback` if available? Worker initial loader can call synchronously but may stutter. Better: postbuild starts warm after scene creation in a promise loop that yields every texture.

Integration plan:
66. Replace `RealisticVillageMaterials.js` to use new shader texture library instead of PNG loader.
67. Keep PNGs unused but not delete.
68. Update interiors/exterior clutter auto use same API via `rvMaterial`.
69. Add `warmVillageShaderTextures` call in MitzvahWorldPostBuild or loader before/after visual layer. Maybe before visual layer to avoid fallback flashing.
70. Add optional tool script `tools/generateShaderTexturePreview.js` to write PNG previews of shader textures if desired, using pure JS PNG encoder. User said no need for PNGs, but wants scripts to generate in the spot. We can create a JS script that can output previews to assets if run, but runtime does not depend on them.
71. Need actual `scripts` folder or `tools` folder; can place `tools/generateVillageShaderTexturePreviews.mjs`.
72. It should import the shader algorithm? Browser ES imports of THREE path won't work in Node; better separate algorithm from THREE? To avoid complexity, put the algorithm in a runtime module and a tool with duplicate tiny PNG encoding? But duplicate logic bad. Maybe no tool now; but user explicitly asked make scripts to generate them. Create a self-contained script that mirrors the shader algorithm and writes preview PNGs. Runtime uses DataTexture algorithm. Fine.
73. But do not overdo; main system first.

Performance risks:
74. Generating 13 * 4 channels * 256^2 ~= 3.4M pixels; fine but CPU on Android might spike. Warm only 13 albedo + 13 normal + 13 roughness maybe = 2.5M; okay if chunked.
75. MeshStandardMaterial many normal maps might cost GPU. Use Lambert with map by default, optionally normal on Standard for beauty. In Three, MeshLambertMaterial ignores normalMap? Actually it supports bumpMap? NormalMap is for MeshStandard/Phong. Use MeshStandardMaterial only on beauty/balanced? Maybe default material uses MeshLambertMaterial with map; for texture richness, normal map less useful unless Standard. Could use MeshPhongMaterial with normalMap; mobile cost moderate. Use MeshStandardMaterial for cottage/clutter because count modest. Speed mode can force Lambert.
76. Material creation should check localStorage/mobile settings only on main thread? Worker cannot localStorage. Keep default balanced and no document.

Files to touch:
- New: `ProceduralShaderTextureLibrary.js`.
- Rewrite: `RealisticVillageMaterials.js` to depend only on shader texture library.
- Rewrite: `MitzvahWorldPostBuild.js` to warm cache.
- Rewrite: `loadNivrayim/index.js` to cache bust postbuild.
- Rewrite: `WorldHeescheel.js` to cache bust postbuild.
- Rewrite: `OlamGrafting`/`Plain`/`OlamVessel`/`ModulePathLedger` only if necessary to force new loader path. Maybe already visual-reality loader seal; bump again.
- New script: `tools/generateVillageShaderTexturePreviews.mjs` maybe.

Awtsmoos chapter:
The PNGs were stones. Now the light itself becomes the quarry. A fragment-like formula will carve grass, clay, wood, dirt, rug, cobble, and plaster inside RAM before the village wears them. No file must be fetched. No image must be loaded. The texture is born where the scene is born.