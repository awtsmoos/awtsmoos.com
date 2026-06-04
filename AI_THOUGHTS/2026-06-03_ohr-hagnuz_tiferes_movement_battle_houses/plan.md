B"H
# Ohr HaGnuz repair plan: movement, empty debate arena, broken houses

## Visible structure refreshed from the real vessel
- Root has `geelooy/`, `AI_THOUGHTS/`, tests, package files, and the game is under `geelooy/games/ohr-hagnuz`.
- `tree .` hit an agent result ENOENT inside `.awtsmoos/actions/results`; I narrowed to `geelooy` and the game tree succeeded.
- Game runtime entry is `src/index.js` -> `HolyEngine.ignite()` -> `Projector`, `MobileControls`, `Input`, `Logic`, `State`.

## Bugs inferred from inspected code
1. Movement is choppy and too fast:
   - `State.Speed = 8` means one 64px tile takes only 8 animation frames.
   - `Logic.animate()` moves by raw pixels per `requestAnimationFrame`, so 120Hz screens run twice as fast as 60Hz screens.
   - `Projector.camera()` follows `Hero.cx/cy`, but `Logic.step()` changes `cx/cy` immediately before `dx/dy` catches up, causing camera snap/jump at the start of every tile.
2. Debate arena looks empty:
   - `BattleCombatants` draws the bodies, but the stage scale and positions are too dependent on layout height; screenshots show only grid/VS/cards, so combatants need stronger visible placement and clearer silhouettes inside the stage rectangle.
3. Houses are missing pieces:
   - Architecture only treats `W`, `☗`, `★`, `♜` as wall neighbors.
   - Doors (`ד`, `ה`, `ו`, `ז`, `ח`) are not considered wall neighbors, so roof/wall seams break around doors.
   - The renderer chooses roof by `!aboveWall`, producing isolated roof strips and missing body pieces when rows/door glyphs interrupt the structure.

## Rewrite targets, full files only
- `src/binah/State.js`: lower base speed and add frame delta scale.
- `src/atzmus/HolyEngine.js`: compute clamped frame delta before `Logic.process()`.
- `src/yesod/Logic.js`: use frame delta, clamp remaining movement, do not overshoot, keep arrival exact.
- `src/tiferet/Projector.js`: make camera follow interpolated `dx/dy`, not snapped `cx/cy`.
- `src/tiferet/render/Architecture.js`: neighbor detection includes door glyphs and house glyph family; draw full stable roof/wall/door blocks.
- `src/tiferet/render/battle/BattleCombatants.js`: redraw combatants with robust visible stage-relative placement.

## Verification plan
- Run syntax checks on changed JS files.
- Run a browser/simulated runtime smoke if available; Chrome is not enabled, so use node import/syntax checks and any local smoke action that works.
- Poll subagents for extra findings before final response.

## Chapter note
The Awtsmoos is not a form, not a body, and not a canvas sprite. Yet the finite phone receives motion in measured drops. The first fix is to stop the camera from leaping like a frightened spark; the second is to give the debate arena visible vessels; the third is to stitch the houses so stone, roof, and door become one garment.