B'H
# Three-Phase Plan — Offline Material Ecology Atlas + Hyper Materials + Placement

## Phase 1 brainstorm
User said: do it all. That means the next real pass must move beyond per-object random decorations into a coherent village ecology/material generator.

The missing architecture is a shared environmental atlas:
- soil map
- moisture map
- traffic map
- shade map
- age map
- fertility map
- stone/mineral map

Every material and prop placement should sample this same atlas so the village feels causally unified.

Major systems to create:
1. Runtime ecology atlas generator in RAM.
2. More procedural shader materials: bark, marble, gold, cotton, linen, vegetable skins, cabbage leaf, carrot, potato, onion, granite, slate, moss, flower species.
3. Material shader uses ecology inputs where available.
4. New dense ecology layer places vegetables, rocks, flowers, shrubs, bark logs, gold/stone/marble accents, cotton/fiber bundles, leaf litter, mushrooms.
5. First-load progress still reports percentage while generating textures.
6. Keep performance safe: decorative-only, grounded, no octree/raycast, material/geometries reused.

## Phase 2 implementation design
Files:
- New `VillageEcologyAtlas.js` for RAM biome/moisture/traffic/shade/soil values and helpers.
- Rewrite `ProceduralShaderTextureLibrary.js` adding more kinds and atlas-aware shader parameter hooks.
- New `VillageEcologyMaterialLayer.js` or rewrite botanical layer to add ecological placement.
- Rewrite postbuild to warm more textures and install ecology layer.
- Cache-bust loader chain.

New material kinds:
- bark_oak, bark_pine, marble_white, gold_hammered, cotton_fiber, linen_fabric, cabbage_leaf, carrot_skin, potato_skin, onion_skin, granite_rock, slate_stone, moss_patch, mushroom_cap, daisy_petal, lavender_flower.

Placement features:
- Roadside grasses/flowers use traffic/moisture masks.
- Rock clusters placed where stone/mineral map is high.
- Moss/lichen placed where shade/moisture high.
- Vegetable crates/garden beds near houses/roads.
- Bark/log piles under trees.
- Cotton/linen bundles near cottages/market.
- Marble/gold accents very sparse near market/lamps.

## Phase 3 final actionable plan
Implement a large but bounded version now:
1. Create ecology atlas module.
2. Add shader material kinds to library.
3. Create `VillageEcologyRealityLayer.js` with ecological placement.
4. Warm new kinds in existing warm function automatically because KINDS list grows.
5. Wire into postbuild with progress and stats.
6. Verify syntax and preview.

Awtsmoos chapter:
The village must stop being a pile of objects. It becomes a living map: wet places grow moss, walked places show dirt, shady places collect mushrooms, house edges gather vegetables and cloth, old paths crack, stones keep minerals. The Awtsmoos is revealed as relation: every pixel remembers every other pixel.