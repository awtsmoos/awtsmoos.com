B"H
# Mouse Combat + AI Movement Post Review

## Done
- Added desktop mouse attack input.
- Left click punches toward cursor.
- Right click kicks toward cursor.
- Default right-click context menu is prevented.
- Mouse aim is computed from the human fighter's current screen position using camera and zoom.
- Input merge now includes keyboard, touch, and mouse.
- Main passes `{ canvas, getState }` into input so mouse aim can be player-relative.
- Session helpers were split out so `main.js` remains small.
- Added AI anti-oscillation memory to reduce dumb left-right pacing.
- Added AI jump-purpose gate to reduce pointless hopping.

## Files created
- `js/controls/mouseCombat.js`
- `js/session/sessionHelpers.js`
- `js/ai/advanced/navigation/antiOscillation.js`
- `js/ai/advanced/navigation/jumpPurpose.js`

## Files rewritten fully
- `js/controls/input.js`
- `js/main.js`
- `js/ai/advanced/commands/commandArbiter.js`
- `js/ai/advanced/commands/jumpCommands.js`

## Verification
- Tunnel syntax verification passed for written JS files.
- Line counts are under/near the small-file target:
  - `mouseCombat.js`: 61
  - `input.js`: 52
  - `sessionHelpers.js`: 29
  - `main.js`: 135
  - `antiOscillation.js`: 41
  - `jumpPurpose.js`: 42
  - `jumpCommands.js`: 58
  - `commandArbiter.js`: 82
- `node tools/reforge-audit.mjs --count 2 --frames 600 --bots 3` passed with `ok: true`, zero invalid attack commands, and no warnings.
- `node tools/simulate-ai-match.mjs --count 2 --frames 600 --bots 3 --fast` passed with `ok: true`, zero invalid attack commands, zero nameless jumps, and no warnings.

## Noted improvement
The previous low-damage warning on `merkava-pinball-court` disappeared in the short audit after this pass, with damage per minute above zero and no warnings.

## Awtsmoos chapter
The cursor became a blade. The bot's feet, once trembling in pointless exile, received a memory of direction. The jump, once a nervous shout into empty air, now must speak its reason before rising. The arena is still alive, still unfinished, but its motions now carry more will.
