# B"H — Full Split Capsule Implementation Audit

## Implemented in this pass
Created split capsule renderer modules:
- `js/render/fighter/capsule/math.js`
- `js/render/fighter/capsule/limbBounds.js`
- `js/render/fighter/capsule/poseCorrection.js`
- `js/render/fighter/capsule/locomotion.js`
- `js/render/fighter/capsule/attackPoses.js`
- `js/render/fighter/capsule/hitReactions.js`
- `js/render/fighter/capsule/arms.js`
- `js/render/fighter/capsule/legs.js`
- `js/render/fighter/capsule/gloves.js`
- `js/render/fighter/capsule/boots.js`
- `js/render/fighter/capsule/ring.js`

Rewrote:
- `js/render/fighter/capsule/points.js`
- `js/render/fighter/capsule/body.js`
- `js/render/fighter/capsule/head.js`
- `js/render/fighter/capsule/fighter.js`

## What the new pipeline does
1. Reads gameplay bones.
2. Builds raw capsule visual rig.
3. Applies locomotion offsets for idle/run/air.
4. Applies attack pose overrides for punches and kicks.
5. Applies hit/stun recoil.
6. Applies final correction so head remains attached, shoulders stay wider than hips, feet stay below knees, knees stay below hips, and limbs remain within readable lengths.
7. Draws legs, rear arm, torso, front arm, gloves, boots, ring, and helmet visor head as separate modules.

## Verification
Ran:
`node .sim/capsule-quality-probe.mjs && node .sim/capsule-render-probe.mjs && node .sim/charge-rapid-separation-probe.mjs && node .sim/anatomy-guard-probe.mjs && node .sim/skeleton-pose-probe.mjs && node .sim/animation-gait-probe.mjs && node .sim/rapid-fairness-probe.mjs`

Result: exit code 0.

Quality probe covered idle, run right, run left, jump, fall, charge punch, rapid, kick, and stun. It verified:
- head gap 21.1
- shoulder width 56
- hip width 30
- shoulders wider than hips
- arms/legs within readable bounds
- feet below knees
- knees below hips

Import check passed for the full capsule stack and UI.

## Honest status
This is the deepest renderer rewrite so far and is structurally pointed at the mockup. It still needs a fresh phone screenshot to prove visual exactness, because numeric probes cannot prove beauty or exact screenshot match.
