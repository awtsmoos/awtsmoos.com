B'H
# Complete Material Rebuild Audit

Implemented:
1. New shared primitive module:
   - `MaterialSynthesisPrimitives.js`
   - Provides crisp reusable masks: crystals, cracks, capsule veins, thread weave, branch veins, petal SDF, potato eyes, rings, crack networks.
2. Full runtime ecology material rewrite:
   - `EcologySpecialMaterials.js`
   - Replaced the softer FBM-first look with structural synthesis first, noise second.
   - Bark now has plates, cracks, scars.
   - Marble has multiple vein layers.
   - Granite has crystal cells, quartz, mica.
   - Gold has hammered dents and scratches.
   - Cotton/linen use thread weave.
   - Cabbage has branch veins and bite damage.
   - Carrot has rings/fibers.
   - Potato has eyes/bruised darker eyes.
   - Onion has layered bands.
   - Slate has strata/cracks.
   - Moss has fibrous tufting.
   - Mushroom/flowers have petal/rib/center structures.
3. Preview generator rewritten:
   - `tools/generateEcologyMaterialPreviews.mjs`
   - Generates using the same sharp structural ideas.
4. Generated previews:
   - `assets/textures/ecologyMaterialPreviews`
   - 80 PNGs generated at 256px.
5. Cache busting:
   - `MitzvahWorldPostBuild.js` and `VillageEcologyRealityLayer.js` now import `complete-v3-ecology-materials-20260612-bh3`.
   - Loader postbuild imports now use `complete-v3-postbuild-20260612-bh3`.
   - Graft/root chain now uses `complete-v3-loader/graft/root-vessel` seals.

Verification:
- Node syntax checks passed for primitives, ecology materials, preview generator, postbuild, ecology layer, loader/root chain.
- Preview generator completed: 80 files.
- HTTP launch preview returned 200.

Important caveat:
- I still could not visually inspect Chrome rendering because browser automation is disabled. The preview PNGs are generated on disk for inspection.

Awtsmoos chapter:
The third rebuild made a covenant with edges. The material no longer begins as fog; it begins as a structure: crystal, scar, vein, thread, eye, ring, petal. Noise is demoted to dust.