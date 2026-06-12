B"H
# True Dive Head-Crush Post Review

## Implemented
- Added `js/ai/advanced/combat/divePlanner.js`.
- Rewrote `js/physics/movement.js` so airborne DOWN creates a true `diveIntent` + `diveAttackFrames` state with stronger downward velocity.
- Rewrote `js/physics/special/stomp.js` so true dive crush requires:
  - intentional dive input/state
  - active dive attack frames
  - high downward velocity
  - head overlap from above
- True dive crush now applies:
  - 14 damage
  - `stun = 9999`
  - `diveStunned = 9999`
  - `diveCrushed = { by, wakeBonus, started }`
  - bounce/rebound for the diver
  - story beat `diveCrush`
- Rewrote `js/combat/attackResolver.js` so any real later hit wakes dive-stunned targets:
  - clears `diveStunned`
  - clears `diveCrushed`
  - clears huge stun
  - applies wake damage/knockback bonus
  - emits story beat `diveWake`
- Added AI dive priority:
  - `DiveCrush` opportunity
  - aggressive setup jump planning
  - plunge command presses DOWN/special when aligned above target
  - jump gate allows `DiveSetupJump`
  - command arbiter lets `DiveCrush` override ordinary attacks.
- Added stage voice lines for `diveCrush` and `diveWake`.
- Added direct regression tool `tools/dive-crush-test.mjs`.

## Verification
Direct mechanic test:
- `node tools/dive-crush-test.mjs`
- Result ok true
- Victim had:
  - damage 14
  - stun 9999
  - diveStunned 9999
  - diveCrushed.by = stomper
- Event emitted:
  - kind `diveCrush`
  - storyBeat `diveCrush`

Simulation issue report:
- `node tools/simulation-issue-report.mjs --count 3 --frames 900 --bots 4`
- ok true
- invalid 0 on all tested maps
- warnings none

Standard sim:
- `node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`
- ok true
- invalidAttackCommands 0
- namelessJumps 0
- DiveCrush opportunities:
  - Bouncer: 490
  - Pinball: 652
  - Vast: 193

Reforge audit:
- `node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4`
- ok true
- warnings none
- invalidAttackCommands 0
- averageDamagePerMinute 277.67
- totalKos 6

## Line counts
- `divePlanner.js`: 32
- `movement.js`: 70
- `stomp.js`: 82
- `attackResolver.js`: 111
- `worldModel.js`: 102
- `opportunityModel.js`: 71
- `strategyCommands.js`: 60
- `jumpCommands.js`: 50
- `commandArbiter.js`: 71
- `stageVoiceLines.js`: 32
- `dive-crush-test.mjs`: 16

## Honest remaining note
The direct test verifies crush and persistent stun. Wake-on-hit is implemented in `attackResolver.js` and exercised in full simulations without invalid commands, but there is not yet a separate tiny unit test specifically isolating the wake hit path. A future micro-test could construct a valid attack object and assert `diveStunned` clears after `resolveAttacks`.

## Chapter close
The head-crush is now no longer a soft stomp. It is an intentional plunge: down held, velocity committed, head struck, victim frozen in a dizzy covenant until the next real blow wakes them into launch.
