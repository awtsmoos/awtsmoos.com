B"H
# Dive Stun Timer + Rush + Indicator Post Review

## Implemented
- Changed true dive-crush stun from permanent `9999` to timed 7-second stun:
  - `stun = 420`
  - `diveStunned = 420`
  - `diveCrushed.naturalWake = 420`
- Added natural ticking in `physics/special/stomp.js`:
  - dive stun decreases every frame through `resolveStomps`
  - when timer reaches zero, `diveCrushed` clears and `stun` clears
- Kept early wake-on-hit through `combat/attackResolver.js`.
- Added `state.diveStunPing` when a dive crush happens.
- Added `ai/advanced/strategy/diveStunPing.js`:
  - reads stunned victim
  - gives bots a high-value global rush target
  - expires when victim wakes, dies, hides, or ping ends
- Wired AI:
  - `npcMind.js` steps dive-stun ping
  - `worldModel.js` exposes `diveStunRush`
  - `chooseStableTarget` immediately targets stunned victim when ping is active
  - `opportunityModel.js` adds `DiveStunRush`
  - `strategyCommands.js` rushes toward stunned victim with hunt/special movement
- Added fairness indicators:
  - `render/offscreenIndicators.js` shows 🌀 + seconds for offscreen dive-stunned fighters
  - `render/ui.js` shows 🌀 + seconds in the bottom HUD card and offscreen beacon
- Updated `tools/dive-crush-test.mjs` to expect timed 420-frame stun and ping.

## Verification
Commands run:
- `node tools/dive-crush-test.mjs`
- `node tools/simulation-issue-report.mjs --count 3 --frames 900 --bots 4`
- `node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4`
- `node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`

All exited 0.

## Direct test result
- ok true
- victim damage 14
- victim stun 420
- victim diveStunned 420
- victim diveCrushed.by `stomper`
- ping created with victimId `victim`, frames 300, urgency 220
- event kind `diveCrush`

## Simulation results
- reforge audit ok true
- failures none
- warnings none
- invalidAttackCommands 0
- standard sim ok true
- namelessJumps 0
- DiveCrush opportunities still high:
  - Bouncer 521
  - Pinball 547
  - Vast 230
- DiveStunRush appeared in Vast simulation: 12 opportunities

## Honest notes
- The offscreen/HUD indicator code is implemented and syntax-verified, but not visually browser-screenshotted in this pass.
- DiveStunRush appears when dive-stun happens in simulation, but the frequency depends on actual successful dive crushes.

## Chapter close
The crush is now fair: seven seconds of dizzy doom, not an infinite prison. The arena hears it. Bots rush it. The UI marks it with a spiral so no offscreen stun becomes a mystery.
