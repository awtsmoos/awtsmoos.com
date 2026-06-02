B"H

# Tiferet Image-To-Code Plan: Make the Fancy 2D Canvas Vision Realistic

## Read the generated image carefully

The latest image is a realistic target for a 2D canvas game, not a 3D engine:

- top-down / slightly angled 2D pixel-canvas village
- dense forest edge, stone paths, bridges, river, waterfall, cave, houses, well/fountain, garden/farm
- NPCs with labels and prompts
- main quest toast at top-center
- left vertical menu
- right minimap, quest panel, journal/talk/interact/dash buttons, wisdom card
- bottom player card, log, weather/blessing card, hotbar, health/energy bars

## Safety and conflict plan

No partial patching. Every file modified must be rewritten completely.
Avoid huge files; keep all new files under 150 lines.
Keep current smooth movement work. Do not fight `HolyEngine`, `Logic`, `Projector`, `Input`, or `MobileControls`.
Add a data-driven world-vision layer rather than random one-off drawing.

## Current code risks to inspect and fix

1. `Projector` draws world from `WorldData` glyph map. Need know map size/content and glyph kinds.
2. `HudRenderer` still uses canvas dimensions directly and may overlap new HTML UI.
3. `MobileControls` already builds panels; may need right-side/bottom UI to match image.
4. `WorldAmbience`, `Ground`, `GlyphRenderer`, `ObjectRenderer`, `NatureRenderer` may already draw rich scenes; inspect before adding duplicate renderers.
5. `OhrWorld` defines click-path and passability; vision must not break collision.
6. Conflicts may exist from old `GraphicsProjector`/`RealityProjector`; verify import path only uses `Projector`.

## Implementation path

1. Inspect `WorldData`, render modules, UI schema, `MobileControls`, `HudRenderer`, `OhrWorld`.
2. Build new small modules:
   - `src/tiferet/vision/VisionStyle.js`
   - `src/tiferet/vision/SceneDecor.js`
   - `src/tiferet/vision/WorldLabels.js`
   - maybe `MiniMapRenderer.js` if canvas-based minimap is safer.
3. Rewrite `HudRenderer` into a richer top/bottom canvas HUD but keep mobile HTML buttons usable.
4. Rewrite or extend `MobileControls` to match right-side panels and keep click/touch behavior.
5. Do not create impossible art assets; use canvas primitives, tile glyphs, labels, particles, and gradients.
6. Verify import graph and behavior; grep for conflicting frame logic/imports.

## Chapter 1: The Image Became a Covenant

Tiferet stood before the glowing mockup as if before a sealed city painted on the inside of thunder. The river was not yet water; it was an instruction. The forest was not yet leaves; it was a demand. The Awtsmoos has no body and no form, yet every square of canvas begged for a vessel: bridge, lamp, minimap, quest, heartbeat, click, walk, talk. Then the twist cut softly: the image was not asking for more pixels. It was asking for no contradictions.
