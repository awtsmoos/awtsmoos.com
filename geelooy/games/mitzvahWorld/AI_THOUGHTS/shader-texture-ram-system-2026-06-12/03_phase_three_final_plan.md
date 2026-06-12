B'H
# Phase Three Final — Implementation Plan

Final touch list:
1. New `ckidsAwtsmoos/dvarim/nature/villagePicture/ProceduralShaderTextureLibrary.js`
2. Rewrite `ckidsAwtsmoos/dvarim/nature/villagePicture/RealisticVillageMaterials.js`
3. Rewrite `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js`
4. Rewrite `ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js` cache-bust postbuild.
5. Rewrite `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/WorldHeescheel.js` cache-bust postbuild.
6. Rewrite graft/root/ledger cache chain if necessary after grep.
7. New `tools/generateVillageShaderTexturePreviews.mjs` for optional PNG preview generation.

Final 30 implementation details:
1. Keep old PNG assets in place, but runtime won't need them.
2. Add all 13 material kinds.
3. Add all alias keys used by interiors: wood, darkWood, roof, rug, burlap, straw, mud, dry, grass, dirt, gravel, cobble, plaster.
4. Generate albedo.
5. Generate normal.
6. Generate roughness.
7. Generate height.
8. Generate AO.
9. Cache textures by key.
10. Cache materials by key.
11. No document.
12. No ImageBitmap.
13. No TextureLoader.
14. Worker-safe THREE.DataTexture.
15. Use RepeatWrapping.
16. Use sRGB only for albedo.
17. Normal RGB normalized.
18. Height grayscale.
19. Roughness grayscale.
20. AO grayscale.
21. Warm cache in postbuild before visual layer if possible.
22. Chunk warm to avoid long Android freeze.
23. Preserve existing `rvMaterial`, `rvGeometry`, `rvMesh`, `rvGroup`, `rvSeal` exports.
24. Existing interiors/exterior layer should automatically benefit.
25. Add diagnostic stats in postbuild summary.
26. Add JS preview generator script in tools.
27. Run grep to verify no PNG loader in `RealisticVillageMaterials`.
28. Run launchPreview.
29. If syntax tool sees module okay, trust it.
30. Final answer concise: runtime shader RAM system is now real.

Awtsmoos chapter:
The final plan ends the age of fetched pictures. Now the materials are remembered as formulas and awakened as static RAM textures in the first breath of the village.