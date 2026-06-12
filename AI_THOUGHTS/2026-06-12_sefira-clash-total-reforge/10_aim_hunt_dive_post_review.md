B"H
# Aim Mirror / Hunt / Dive / Rapid Post Review

## Implemented
- Stored click/manual attack aim now mirrors when fighter facing flips.
- Rapid fire wording and tuning changed: rapid is no longer sticky glue; every rapid hit rewrites velocity like a real hit, with only minimal stun.
- Airborne down input now creates a dive state with extra downward velocity.
- Dive-stomp landing on a head applies short dive stun, bounce, and damage.
- Any real hit wakes dive-stunned victim.
- AI target scoring split into `targetScoring.js` and made more hunt-oriented.
- AI move commands now mark `hunt` on far/bored chase.
- Movement now honors `input.hunt` as a speed multiplier.
- HSM offstage detection tightened so huge-map travel is not mistaken for recovery.

## Files created
- `js/controls/aimMemory.js`
- `js/ai/advanced/navigation/targetScoring.js`

## Files fully rewritten
- `js/combat/inputIntent.js`
- `js/combat/rapidAttack.js`
- `js/physics/knockback.js`
- `js/physics/movement.js`
- `js/physics/special/stomp.js`
- `js/combat/attackResolver.js`
- `js/ai/advanced/navigation/worldModel.js`
- `js/ai/advanced/commands/moveCommands.js`
- `js/ai/advanced/hsm/stateMachine.js`

## Verification
- Syntax passed on all written JS files.
- Line counts stayed under 120 for the touched files inspected:
  - `aimMemory.js`: 26
  - `inputIntent.js`: 86
  - `rapidAttack.js`: 30
  - `knockback.js`: 79
  - `movement.js`: 79
  - `stomp.js`: 98
  - `attackResolver.js`: 116
  - `targetScoring.js`: 39
  - `worldModel.js`: 119
  - `moveCommands.js`: 80
- `node tools/simulate-ai-match.mjs --map tiferes-vast --frames 2400 --bots 5 --fast` passed with `ok: true`, zero invalid attacks, zero nameless jumps, no warnings, and 333 damage/minute.

## Honest note
A short 900-frame all-map audit can still mark huge maps as low damage because `tiferes-vast` is extremely wide and fighters spawn far apart. The longer targeted tiferes run shows they do eventually hunt and fight. A later pass should add map-specific engagement objectives or closer early-match rally points so huge stages create combat faster without losing scale.

## Awtsmoos chapter
The remembered angle now turns with the body like a constellation reflected in a sword. The dive now has teeth. The rapid spark now throws instead of glues. And the bots, though still imperfect, have been commanded to stop mistaking exile for strategy and begin crossing the kingdom toward prey.
