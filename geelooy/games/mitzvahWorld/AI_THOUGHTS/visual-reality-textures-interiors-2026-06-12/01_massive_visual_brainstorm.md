B'H
# Phase One: Massive Visual + Performance Brainstorm Before Real Writes

User command: make it real; manually generate top-down realistic textures directly into mitzvahWorld assets; use them; do not stop until done; brainstorm hard first.

Important reality check:
- There is no visible `image eye command in yaml` tool exposed in this tunnel interface. I will implement the intent by generating real PNG texture assets programmatically in the project assets folder using command-side code. These will be actual image files, top-down/seamless/procedural, not text placeholders.
- I must avoid partial patching; every touched JS file must be fully rewritten.

Big visual target:
1. Village should move from stylized demo toward lived-in village.
2. Houses should contain real interior props and materials.
3. Ground should use realistic generated textures.
4. Textures must be real asset files in the repo.
5. Materials should use texture maps where possible.
6. Performance must survive Android.

Huge brainstorm of improvements:

A. Texture asset library
1. Generate seamless grass texture.
2. Generate dry grass texture.
3. Generate packed dirt texture.
4. Generate mud texture.
5. Generate gravel/pebbles texture.
6. Generate cobblestone texture.
7. Generate limestone plaster wall texture.
8. Generate weathered wood planks texture.
9. Generate dark beam bark/wood texture.
10. Generate clay roof tile texture.
11. Generate woven rug texture.
12. Generate sack burlap texture.
13. Generate straw/thatch texture.
14. Generate normal maps from height fields for at least key textures.
15. Generate roughness maps from noise/height.
16. Generate ambient occlusion-ish maps from height.
17. Build a manifest JSON listing texture files and usage.
18. Make textures power-of-two 512/1024 for mobile.
19. Keep assets local to `assets/textures/realisticVillage`.
20. Avoid external images or online dependencies.

B. Terrain visual improvements
21. Replace flat terrain material with generated grass/dirt blended material.
22. Add top-down ground decals: dirt patches, path overlays, gravel clusters.
23. Use repeating textures with anisotropy where available.
24. Keep shader fallback if textures fail.
25. Add broader height variation/hills in active data path, and runtime hill overlays if compile source not active.
26. Add terrain edge fade / fog to hide map boundary.
27. Add micro prop clusters: pebbles, sticks, small flowers.
28. Add path side erosion and worn edge grass.

C. House exterior realism
29. Replace simple materials on gableHouse with generated plaster/wood/roof textures.
30. Add windows with frames, lintels, inner glow.
31. Add doors with panels, handle, threshold step.
32. Add roof ridge caps.
33. Add chimney, smoke mesh/lightweight particles? Maybe later.
34. Add foundation stones.
35. Add garden fence clutter near houses.

D. Interiors
36. House interiors should be accessible or visible through open fronts/windows.
37. Add one or more furnished interior clusters inside each house mesh group.
38. Interior props: table, benches, shelves, books, candle, chest, rug, bed, pillow, blanket, barrels, sacks, clay pot, baskets.
39. Use instanced/simple geometry to keep mobile performance.
40. Use generated textures on wood/plaster/rug/sack.
41. Add warm interior lights that are decorative and low cost.
42. Add `skipRaycast` to interior clutter unless interactable.
43. Add `skipOctree` for tiny clutter to avoid physics overhead.
44. Add `LOD`: clutter disappears far away.
45. Add owner/theme variants: merchant, scholar, farmer, simple family.

E. Village clutter generator
46. Create clusters outside houses: barrels, crates, baskets, tools, carts, hanging cloths, wells, benches.
47. Use deterministic seeded placement.
48. Group props under one postbuild root.
49. Use material cache.
50. Use instanced repeated props where possible.
51. Place around paths, not blocking player.
52. Ground to terrain law.

F. Vegetation realism and performance
53. Use shader grass already written, but upgrade color variations and flower types.
54. Add fallen leaves and twigs as instanced flat decals.
55. Add rocks/pebbles with generated stone material.
56. Add root flares under hero trees.
57. Reduce distant grass count dynamically on mobile.
58. Add simple `TextureQuality` settings hook.

G. NPC/animal visual ecosystem
59. NPC workstations inside houses.
60. Animals should have less toy proportions.
61. Add warning/combat effects that are visible but not expensive.
62. Add shadow/contact blob under animals and NPCs for grounded feeling.

H. Performance architecture
63. One shared material library, no per-object texture loading.
64. Lazy load texture maps only once, cached.
65. Texture resolution capped by performance quality.
66. Skip raycast/octree on all decor/clutter/interiors unless interactive.
67. Merge or instance tiny props.
68. Use `onBeforeRender` sparingly.
69. Distance-gate interior visibility.
70. Reuse geometries.
71. Pool VFX.
72. Use diagnostic counters for visible clutter and texture load success.

I. Settings expansion
73. Add visual quality controls: textures, clutter, interiors, grass, wildlife smoothing.
74. Settings gear should expose a diagnostics copy.
75. Add low/medium/high visual toggle with localStorage.
76. Speed mode should reduce clutter/interior lights.
77. Beauty mode uses more clutter and texture repeat detail.

J. Implementation strategy now
78. First inspect current assets folder and cottage recipe.
79. Generate texture PNG assets and manifest.
80. Create material library module for texture loading/caching.
81. Rewrite cottage recipe to use materials + interior clusters.
82. Add a village clutter postbuild layer if cottage recipe not enough.
83. Cache bust recipe map and nature exports as needed.
84. Reground decor after new props.
85. Test syntax and preview.

Likely immediate files:
- `assets/textures/realisticVillage/*` new generated PNG/JSON.
- `ckidsAwtsmoos/dvarim/nature/villagePicture/RealisticVillageMaterials.js` new.
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js` rewrite.
- `ckidsAwtsmoos/dvarim/nature/villagePicture/InteriorClutterRecipe.js` new.
- `ckidsAwtsmoos/dvarim/nature/villagePicture/recipeMap.js` rewrite/cache bust.
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/VillageVisualRealityLayer.js` new for exterior clutter/decals maybe.
- `MitzvahWorldPostBuild.js` rewrite to call visual layer.

Awtsmoos chapter:
The village is not a texture; it is a memory of footsteps. A house is not walls; it is a table worn by elbows, a rug with dust, a shelf with books, a pot near the hearth, and a door that says someone returns at night. We will carve those memories into images and meshes, but the mobile vessel must still breathe.