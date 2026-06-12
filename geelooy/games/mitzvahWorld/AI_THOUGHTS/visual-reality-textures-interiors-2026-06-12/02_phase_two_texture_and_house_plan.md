B'H
# Phase Two: Concrete Texture + House + Material Plan

Inspection results:
- Existing cottage recipe is split into `cottageRecipe.js`, `interiorDetails.js`, `brickMason.js`, `roofAndExterior.js`.
- Existing `geometryKit.js` already procedurally creates DataTexture-like material patterns in code, but the user asked for actual texture assets in the mitzvahWorld assets folder.
- Python exists on Android tunnel, but Pillow is not installed. Therefore actual PNG generation must use a pure Python PNG encoder with zlib. This is acceptable and creates real image assets.

Plan now:
1. Create `assets/textures/realisticVillage`.
2. Generate real PNGs manually using pure Python:
   - grass_meadow_albedo.png
   - grass_meadow_normal.png
   - grass_meadow_roughness.png
   - dirt_path_albedo.png
   - dirt_path_normal.png
   - dirt_path_roughness.png
   - gravel_pebble_albedo.png
   - cobble_stone_albedo.png
   - plaster_limestone_albedo.png
   - weathered_wood_albedo.png
   - dark_beam_wood_albedo.png
   - clay_roof_tiles_albedo.png
   - woven_rug_albedo.png
   - burlap_sack_albedo.png
   - straw_thatch_albedo.png
   - manifest.json
3. Build `RealisticVillageMaterials.js`:
   - Shared material cache.
   - Shared geometries.
   - Worker-safe async image loading via `ImageBitmapLoader` when possible.
   - Fallback DataTexture if image loading unavailable.
   - `rvMat(kind, options)` returns MeshLambertMaterial with texture map.
   - No TextureLoader in worker.
4. Build or rewrite `InteriorClutterRecipe.js`:
   - Uses realistic materials and tiny meshes.
   - Creates several thematic clusters: scholar, merchant, farmer, family.
   - Adds table, benches, shelf/books, rug, bed, pillow/blanket, barrels, sacks, crates, candle/lamp, pottery, baskets.
   - Marks skipRaycast/skipOctree.
5. Rewrite `interiorDetails.js` to call the new cluster builder but keep compatibility with old cottage recipe.
6. Rewrite `cottageRecipe.js` to use the richer interior and maybe apply visual material layer to shell if shell builder does not use new mats directly.
7. Add `VillageVisualRealityLayer.js` postbuild for exterior clutter around houses / paths:
   - barrels, crates, carts, buckets, sacks, woodpiles, rugs on lines, garden tools.
   - deterministic placement around known house-ish spots.
   - use terrain law grounding if available.
8. Rewrite `MitzvahWorldPostBuild.js` to call visual reality layer and cache bust chain.

Performance guardrails:
- All clutter has `skipRaycast`, `skipOctree`, `villageDecor`.
- Use BoxGeometry/CylinderGeometry/SphereGeometry caches.
- No per-frame updates except existing lamps/lights.
- No heavy textures beyond 512 PNGs.
- Beauty/speed settings can later hide clutter if needed; for now keep modest counts.

Awtsmoos chapter:
The picture must become matter. The PNGs are not decoration; they are the ground's memory. The house must stop being a symbolic shell and become a room with a bed, table, books, sacks, rug, warm lamp, and a reason to exist.