B"H

# Gevurah Repair: From Choppy Prototype to Living Top-Down World

## Inspected structure

Root: `/storage/emulated/0/Documents/git/awtsmoos.com`.
Project: `geelooy/games/ohr-hagnuz`.
Important visible folders: `src/atzmus`, `src/binah`, `src/asiyah`, `src/tiferet`, `src/data`.

## User pain

The current game feels choppy. The target is a top-down, doable upgrade inspired by the fresh concept image:

- smoother player movement and camera flow
- calmer animation cadence
- less stutter from canvas scaling / repaint choices
- richer but practical world feeling
- functioning HUD panels and less placeholder behavior
- keep existing architecture, rewrite whole files only

## Brainstorm

Likely choppiness causes to verify:

1. Tile movement snaps `dx/dy` at fixed integer speed instead of interpolating by elapsed time.
2. Render loop may use frame count instead of delta time and may resize/canvas scale every frame.
3. Player walk pose may update too rapidly or not correspond to actual movement distance.
4. Camera may follow abruptly, creating perceived choppiness even when movement is correct.
5. Mobile CSS may force canvas pixelated scaling too harshly; top-down concept needs crisp but smooth camera.
6. Rendering may redraw too much without caching static map layers.

## Code plan

Read before touching:

- `src/atzmus/HolyEngine.js`
- `src/tiferet/Projector.js`
- `src/tiferet/render/PlayerRenderer.js`
- `src/tiferet/render/player/PlayerPose.js`
- `src/asiyah/logic/MovementLogic.js`
- `src/yesod/Logic.js` if still exists / used
- `src/index.js`

Implement in small full-file rewrites and new modules:

1. Add a small motion configuration module.
2. Make hero movement delta-time based while preserving tile logic.
3. Smooth camera with lerp and snap guard.
4. Slow/ground player animation by distance/tick.
5. Add optional top-down polish particles / focus rings only if low-risk.
6. Run import tests and a simulated runtime/browser smoke if available.

## Chapter 1: The Chopped Road

Gevurah entered the village at sunset, and every cobblestone jerked beneath his shoes as if time itself were being cut by a dull blade. The river did not flow; it trembled. The lanterns did not breathe; they blinked. The Awtsmoos, with no body and no form, was not trapped in the stutter; the stutter was only the vessel failing to receive the constant newness with grace. So Gevurah knelt, put his hand on the road, and heard the frame-loop whisper: "Do not shove me by frame. Measure me by time. Let me glide by truth."
