B'H
# Audit — Improved Shaders + Botanical World Placement

Implemented this pass:
1. Expanded RAM shader material library:
   - Added `yellow_brick`, `flower_petal`, `leaf_vein`, `lamp_shade`, `lichen_rock`.
   - Added aliases: `yellowBrick`, `flowerPetal`, `leaf`, `lampShade`, `lichenRock`.
   - Added shader logic for brick mortar/bevels, petal masks, leaf veins, parchment lamp shade, lichen-rock green speckles.
   - Total RAM shader material kinds now 18, with 5 channels each = 90 semantic generated maps.
2. Fixed a flower shader branch bug discovered during audit.
3. Rewrote `RealisticVillageMaterials.js` to cache-bust into the botanical shader library.
4. Added `VillageBotanicalRealityLayer.js`:
   - Yellow brick road along a deterministic route.
   - Flower clusters along road edges.
   - Lichen rock clusters.
   - Shrubs.
   - Lamp posts with lamp-shade material and sparse warm point lights.
   - Everything grounded to terrain law, decorative, no octree/raycast.
5. Rewrote `MitzvahWorldPostBuild.js` to warm botanical shader textures and install botanical layer.
6. Cache-busted postbuild/loader/graft/root chain.
7. Updated material import cache seals in visual/interior/cottage/botanical layers.

Verification:
- `node --check` passed on key rewritten JS files.
- Grep found no stale targeted old RAM shader cache strings.
- Preview returned HTTP 200.

Not visually verified:
- Android Chrome automation remains disabled, so I did not visually inspect the yellow road/flowers/rocks/lamp shades in the game.

Awtsmoos chapter:
The shader thumbnails became a road. The road received flowers. The flowers received veins in their leaves. Stones received lichen. Lamps received shades. The village began to gather details in the places where emptiness had been.