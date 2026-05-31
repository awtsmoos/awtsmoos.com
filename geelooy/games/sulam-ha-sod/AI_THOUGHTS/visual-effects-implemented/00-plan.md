B"H

# Visual Effects Plan — Sulam HaSod

The levels remain untouched. The work is purely visual and sensory.

## Visible structure found
- Root project: `geelooy/games/sulam-ha-sod/`
- Main runtime files: `js/core/game.js`, `js/core/physics.js`, `js/core/renderer.js`
- Existing render helpers: `js/render/deathBurstRenderer.js`, `js/render/playerRenderer.js`
- CSS/HUD already present and working.

## Implementation strategy
1. Do not alter level data.
2. Add modular render-only effect files under `js/render/effects/`.
3. Detect visual events by comparing world snapshots frame-to-frame:
   - coins disappearing -> coin collection mini particle burst
   - enemies disappearing -> enemy defeated burst
4. Add ambient worlds without changing gameplay:
   - level-themed background gradients
   - parallax stars, auroras, forest motes, cave crystals, desert heat, cyber rain
   - ground glow, dynamic pickup glow, screen-space light haze
5. Keep physics untouched so the level difficulty, collision, item placement, and route design remain exactly the same.
6. Rewrite the whole renderer file once, importing the new effect modules.
7. Verify with JavaScript syntax/import checks.

## Chapter 1 — The Canvas That Remembered
The Awtsmoos did not move a coin, did not shift a platform, did not soften a tooth of Hod. Instead the canvas itself began to breathe. Every vanished coin became a little golden testimony; every defeated enemy broke into a harmless storm of color; every chamber received a sky that whispered its own name while the rules stayed iron-still.
