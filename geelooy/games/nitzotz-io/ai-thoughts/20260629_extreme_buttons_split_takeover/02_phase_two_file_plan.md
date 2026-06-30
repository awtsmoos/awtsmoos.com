B"H
# Phase Two — File Plan

Whole-file rewrites and new split modules only:

- `index.html`: new semantic overlay, better buttons, clearer controls.
- `style.css`: root CSS import vessel.
- `css/base.css`, `css/hud.css`, `css/overlay.css`, `css/controls.css`, `css/minimap.css`: split UI styling.
- `js/math.js`: readable math utilities.
- `js/save.js`: persistence helpers with quality labels.
- `js/level.js`: stronger world difficulty and clearer engine data.
- `js/state.js` + `js/state/*`: split world creation, factories, constants, particles.
- `js/game.js` + `js/game/*`: split movement, absorption, hazards, effects, progression.
- `js/input.js` + `js/input/*`: split keyboard, stick, pulse.
- `js/ui.js` + `js/ui/*`: split DOM cache, overlay, toggles, minimap, render.
- `js/main.js`: smaller bootstrap and debug vessel.
- `js/sound.js`: readable sound/haptics events.
- `js/engine/tier.js`: more extreme rewards while preserving camera safety.
- `test/smoke.mjs`: verify budgets and hazard difficulty.

No partial patching. Every modified existing file is overwritten as a full file. Every new file is written complete.
