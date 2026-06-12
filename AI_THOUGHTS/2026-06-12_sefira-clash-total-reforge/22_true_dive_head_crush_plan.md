B"H
# True Dive Head-Crush Implementation Plan

## User mandate
Implement intentional airborne DOWN plunge into enemy head, not merely landing on head:
- Player or bot must intentionally hold DOWN / joystick down.
- Fighter enters true dive/plunge state.
- If descending fast into a victim's headbox, it is a real special attack.
- Victim is stunned until hit next.
- Any later real hit wakes victim and launches normally.
- Bots should prioritize jump-over -> dive down on head -> follow-up attacks.

## Files to inspect / rewrite
1. `js/physics/movement.js`
   - Ensure dive has explicit `diveAttack` / `diveIntent` state and strong downward speed.
2. `js/physics/special/stomp.js`
   - Make true dive stomp distinct from normal stomp.
   - Require diving + downward velocity + head impact + intentional state.
   - Apply persistent `diveStunned` / `diveCrushed` state until hit.
3. `js/combat/attackResolver.js`
   - Any real hit wakes dive-stunned target.
   - Wake hit should optionally get bonus force/effect.
4. `js/ai/advanced/combat/families/attackFamilyScore.js`
   - Add dive attack family scoring if target below / platform camper / role predator/hunter.
5. `js/ai/advanced/combat/tacticPlanner.js` or command layer
   - Make AI intentionally jump above targets and press down when aligned.
6. `js/ai/advanced/commands/jumpCommands.js`
   - Let bots jump for dive setup intentionally.
7. `js/ai/advanced/commands/attackCommands.js` or `strategyCommands.js`
   - Set down input when dive opportunity active.
8. Possibly create:
   - `js/ai/advanced/combat/divePlanner.js`

## Desired behavior
- Light fall: normal stomp.
- True plunge: DOWN-held, diving, vy > threshold, head impact.
- Victim: `diveStunned = Infinity-ish`, `stun = high`, zero/low movement, dizzy visual event.
- Wake: any real hit clears diveStunned and applies normal knockback; wake hit may add launch bonus.
- Rapid fire: wakes target and launches each hit normally.

## Verification
- Run syntax/line checks.
- Run simulations and ensure no invalid attacks / nameless jumps.
- If possible, add a small headless dive unit test/tool later.
