B"H
# Mouse Combat + Smarter Bot Brainstorm

## User demand
- Desktop click on screen should attack toward click direction.
- Left click = punch.
- Right click = kick.
- Disable default right-click context menu.
- Think hard about bots pacing back and forth and jumping pointlessly.

## Inspected control path
- `main.js` calls `createInput(document)`.
- `input.js` merges keyboard, touch joystick, touch buttons.
- `keyboard.js` supplies key states.
- `inputIntent.js` already reads `aimX` and `aimY` and preserves press aim.
- `startAttack.js` turns pressed/held punch/kick into directional attacks.

## Mouse attack design
Create `controls/mouseCombat.js` as a tiny module:
- listens for `pointerdown`, `pointerup`, `contextmenu`;
- only handles real mouse events, ignores touch/pen so mobile controls remain clean;
- computes direction from player screen center if available;
- stores one-frame click pulse as `punch` or `kick`;
- stores `aimX`, `aimY` until read;
- blocks context menu on right click.

Input merge needs access to state/player/canvas to aim at the player rather than viewport center. Current `createInput(document)` has no state. Safer first pass: use viewport center/canvas center. Better pass: allow `createInput(document, { canvas, getState })` and update main. Since user asked desktop screen click direction, actual player-relative aiming is much better. Modify `main.js` call to pass canvas and state getter.

## Bot pacing/jump diagnosis hypotheses
1. AI route toggles between two platform nodes because target/goal changes too often.
2. Jump command has no cost/cooldown after failed jumps.
3. Stuck detector may over-prescribe jumps near ledges/platform lips.
4. `noStillnessLaw` might force movement even when holding center would be smarter.
5. Opportunity model may chase impossible/low-value targets.
6. Bots may not respect personality enough in movement decisions.
7. Navigation needs local damping: don't reverse direction repeatedly unless danger/target requires.
8. Jump should require a meaningful vertical goal, recovery need, attack intercept, or stuck reason.
9. Add anti-oscillation memory: if x direction flips too often, commit to a side for short frames.
10. Add jump discipline: jump only when vertical route action demands it or combat state needs it.

## Intended files
Create:
- `js/controls/mouseCombat.js`
- `js/ai/advanced/navigation/antiOscillation.js`
- `js/ai/advanced/navigation/jumpPurpose.js`

Rewrite fully:
- `js/controls/input.js`
- `js/main.js`
- probably `js/ai/advanced/commands/commandArbiter.js` or jump/move command files after inspection.

## Rule
No partial patching. Rewrite entire touched files only.
