B"H
# Mouse Combat + Anti-Pacing Final Plan

## Mouse click controls
Files:
- Create `js/controls/mouseCombat.js`.
- Rewrite `js/controls/input.js` to merge mouse with keyboard and touch.
- Rewrite `js/main.js` to call `createInput(document, { canvas, getState: () => state })`.

Mouse math:
- Find human fighter from current state.
- Convert hero world position to screen using current camera and zoom:
  `screenX = ((hero.x + camera.x - w/2) * zoom) + w/2`
  `screenY = ((hero.y - 88 + camera.y - h/2) * zoom) + h/2`
- Aim vector is click minus hero screen point.
- Left pointer down pulses punch.
- Right pointer down pulses kick.
- Context menu is blocked.

## AI pacing and pointless jumps
Inspected files:
- `commandArbiter.js` applies movement modes and then jump commands.
- `moveCommands.js` can flip x frame-to-frame toward changing goals.
- `jumpCommands.js` asks `jumpDiscipline.js`, but `needsJump` is still permissive for escape/platform ascend.

Files:
- Create `js/ai/advanced/navigation/antiOscillation.js`.
- Create `js/ai/advanced/navigation/jumpPurpose.js`.
- Rewrite `js/ai/advanced/commands/commandArbiter.js` to damp meaningless left-right flips after mode selection.
- Rewrite `js/ai/advanced/commands/jumpCommands.js` to require a stronger purpose before applying jump.

Behavior:
- Anti-oscillation tracks sign flips of output x.
- If a bot flips too often while not attacking/recovering/escaping, briefly commit or neutralize movement.
- Jump purpose allows jumps for recovery, real escape, vertical route, anti-air, or danger, but denies same-lane/stable pointless jumps.
- Expose reasons in `bot.aiMind.jumpReason` and `bot.aiMind.oscillation` for debug.

## Verification
- Run state import test.
- Run `node tools/reforge-audit.mjs --count 2 --frames 600 --bots 3`.
- Run existing simulator.
- Line count check for touched files.
