B'H
# Phase Three Final Before Asset Generation

Final immediate writes:
1. Pure Python generator script will be executed through command, not saved as a permanent project runtime dependency.
2. Real PNG files will be written to `assets/textures/realisticVillage`.
3. `RealisticVillageMaterials.js` will be a runtime module, fully rewritten/new.
4. `InteriorClutterRecipe.js` will be new.
5. `interiorDetails.js` will be rewritten to use the new clutter generator and generated asset materials.
6. `cottageRecipe.js` will be rewritten with a real visual contract and cache-busted imports.
7. `recipeMap.js` will cache-bust cottage recipe.
8. `VillageVisualRealityLayer.js` will be new postbuild exterior clutter layer.
9. `MitzvahWorldPostBuild.js` will be rewritten to call it.
10. Cache chain already includes Android smooth postbuild in loader; but if direct `WorldHeescheel` calls postbuild, that was cache-busted too.

30 final safeguards:
1. Use actual PNG files, not only DataTextures.
2. Generate manifest JSON.
3. Use deterministic noise so textures are repeatable.
4. Use power-of-two sizes.
5. Keep texture size 512 for mobile.
6. Create normals from height for key ground materials.
7. Create roughness maps for key materials.
8. Avoid TextureLoader in worker where document may be absent.
9. Use ImageBitmapLoader or fallback.
10. Materials return instantly with fallback to avoid async breakage.
11. Async textures update material after load.
12. Store materials in cache.
13. Store geometries in cache.
14. Keep clutter decorative/non-colliding.
15. Keep raycasts away from clutter.
16. Ground exterior clutter to terrain law.
17. No per-frame animation loops.
18. Interior lights modest and few.
19. Use instanced? Later if needed; for now low mesh count.
20. Put several real objects in houses.
21. Use variants so houses feel different.
22. Add exterior living details near houses.
23. Avoid blocking doorways.
24. Add contact-shadow-like dark mats under props if cheap.
25. Use existing `hoyseef` flow indirectly through postbuild scene add.
26. Cache bust recipe imports.
27. Verify generated files exist.
28. Syntax check JS by write verification.
29. Preview returns 200.
30. Audit honestly lists what is real and what remains.

Awtsmoos chapter:
The third plan is the gate before matter. Once crossed, the village receives images, tables, sacks, shelves, and exterior tools. The Awtsmoos will not be spoken here as metaphor only; it becomes bytes on disk and meshes in the scene.