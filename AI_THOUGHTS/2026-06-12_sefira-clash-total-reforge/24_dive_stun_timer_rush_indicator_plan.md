B"H
# Dive Stun Timer + Rush + Offscreen Indicator Plan

## User correction
- Dive-crush stun should NOT be infinite until hit.
- It should wear off naturally after about 7 seconds.
- It should still wake early when hit.
- Bots should detect that someone got dive-crushed/stunned and rush to them from wherever they are.
- If stunned victim is off-screen, the stock/store indicator should show a confusion/dizzy logo so the player knows what happened.

## Implementation targets
1. `js/physics/special/stomp.js`
   - Set `diveStunned` / `stun` to about 420 frames at 60fps.
   - Add `state.diveStunPing` or event metadata so AI can react globally.
2. `js/combat/attackResolver.js`
   - Keep wake-on-hit logic.
   - Do not rely on permanent 9999 values.
3. `js/ai/advanced/navigation/worldModel.js`
   - Expose dive stun ping / stunned target status.
4. `js/ai/advanced/strategy/resourcePing.js` or new helper
   - Reuse resource ping style or create dive-stun ping reader.
5. `js/ai/advanced/strategy/opportunityModel.js`
   - Add `DiveStunRush` opportunity, strong priority when another fighter is stunned.
6. `js/ai/advanced/commands/strategyCommands.js`
   - Move toward stunned target/ping.
7. UI/render files
   - Inspect existing UI / stock indicator / offscreen indicator system.
   - Add confusion logo when a fighter has `diveStunned > 0` and is off-screen or in stock/status indicator.
8. Tools/tests
   - Update `tools/dive-crush-test.mjs` to expect ~420 not 9999.
   - Add or extend verification.

## Verification
- Run `dive-crush-test`.
- Run `simulation-issue-report`.
- Run `reforge-audit` and `simulate-ai-match`.
