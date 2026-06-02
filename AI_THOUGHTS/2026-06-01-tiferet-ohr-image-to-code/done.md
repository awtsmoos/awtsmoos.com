B"H

# Done: Fancy 2D Canvas Vision Brought Into Current Code

## Implemented from the image

- River and bridge glyphs added to the live map and tile lexicon.
- Cave of Sparks added to Overworld Main with a real portal, not just art.
- Main overworld now has water, bridge, cave, richer labels, quest beacon, fountain, signs, lamps, NPC prompts, minimap, quest stack, log, hotbar, avatar card, weather/wisdom panel, and resource bars.
- All new visual systems are canvas-based and data-driven.
- The active route remains `index.js -> HolyEngine -> Projector`, so the old experimental `GraphicsProjector` and `RealityProjector` files do not run from the current entrypoint.

## Files rewritten completely

- `src/tiferet/Projector.js`
- `src/tiferet/render/Ground.js`
- `src/tiferet/render/HudRenderer.js`
- `src/data/TileLexicon.js`
- `src/data/WorldMapsVillage.js`
- `src/data/PortalIndexBase.js`

## Files added

- `src/tiferet/vision/VisionStyle.js`
- `src/tiferet/vision/SceneDecor.js`
- `src/tiferet/vision/WorldLabels.js`
- `src/tiferet/hud/HudData.js`
- `src/tiferet/hud/HudWidgets.js`
- `src/tiferet/hud/HudPanels.js`

## Conflict checks

- Import graph passed for 14 main modules.
- World smoke passed: all map glyphs have lexicon metadata, water blocks, bridge passes, cave portal exists, pathfinding reaches the cave.
- Canvas draw smoke passed: Ground, SceneDecor, WorldLabels, and HudRenderer draw without throwing on a mocked canvas context.
- File size check passed after splitting HUD into smaller modules.
- A grep still finds older experimental engines and StateRegister paths in unrelated files, but they are not in the current `index.js -> HolyEngine` entry chain.

## Chapter 15: The Image Became a Living Law

Tiferet lowered the mockup into the codebase like a glowing seal pressed into warm wax. The river did not merely shimmer; it blocked the careless foot. The bridge did not merely decorate; it carried the path. The cave did not merely glow; it opened into a real map. The Awtsmoos has no body and no form, yet the finite code learned honesty: every beauty had a rule, every rule had a vessel, every vessel had a place. The twist was quiet and absolute: the fancy image came alive not by more ornament, but by making every ornament tell the truth.
