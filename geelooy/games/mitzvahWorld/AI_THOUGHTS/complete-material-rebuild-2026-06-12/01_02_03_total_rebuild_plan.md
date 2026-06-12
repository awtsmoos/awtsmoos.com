B'H
# Complete Material Rebuild Plan — Do Everything Again, Sharper, More Recognizable

## Phase 1 — Reality Tear Brainstorm
The old generators became better but still too much like procedural demos. The missing leap is not more FBM. The missing leap is deterministic structural synthesis: every material starts from hard recognizable masks before noise ever touches it. Bark must have plates. Marble must have branching veins. Granite must have crystals. Cloth must have warp/weft threads. Leaves must have vein graphs. Vegetables must have roots, eyes, rings, membranes. Flowers must have species petals. Stone/metal must have mineral flecks and scratches. Then noise becomes dirt, not identity.

Extreme possible system:
- Structural mask pass: cells, cracks, fibers, veins, petals, rings, strata.
- Damage pass: chips, scratches, fungal spots, dirt, bruises, insect bites.
- Micro pass: pores, grain, thread hair, pollen, dust.
- Physical pass: height, normal, roughness, AO from the same structure.
- Preview pass: generate bigger previews for inspection.

## Phase 2 — File and Algorithm Plan
Modify only full files:
1. Create `MaterialSynthesisPrimitives.js`: reusable sharp functions with no THREE dependency.
2. Rewrite `EcologySpecialMaterials.js`: import primitives, produce much sharper materials.
3. Rewrite `tools/generateEcologyMaterialPreviews.mjs`: generate 256 previews using the same ideas.
4. Optionally add more material variants if code remains safe.
5. Cache-bust postbuild ecology material import.
6. Verify syntax, regenerate previews, preview server.

Core improvements:
- Voronoi crystal mosaic with crisp boundaries for granite.
- Marble: multi-branch vein tree with fine hairline veins.
- Bark: plate graph + exposed scar tissue + vertical fracture lines.
- Gold: hammered dent cells + directional scratches + metallic roughness.
- Cotton/linen: clear thread-over-thread with individual thread shadows.
- Cabbage/leaf: central and branching vein network + insect bite masks.
- Carrot: horizontal rings, longitudinal fibers, root scars.
- Potato: eyes, bruises, dirt patches.
- Onion: translucent layered arcs and dry edges.
- Slate: sediment strata and sharp fracture planes.
- Moss: tiny clump islands and filament clusters.
- Mushroom: cap radial ribs and spotted pattern.
- Flowers: petal SDF clusters and center discs.

## Phase 3 — Final Implementation Contract
Do now:
- Full-write primitives module.
- Full-rewrite ecology material runtime.
- Full-rewrite preview script.
- Generate 80 preview PNGs at 256px.
- Cache bust imports.
- Node syntax check.
- HTTP preview.

Awtsmoos chapter: The world asks for edges. So the code must become a knife. Every texture is carved first as a diagram of truth, then colored, then damaged, then raised into height.