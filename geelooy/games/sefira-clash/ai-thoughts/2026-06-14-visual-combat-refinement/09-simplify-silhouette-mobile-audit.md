# B"H — Simplify Silhouette and Mobile Audit

## What changed
- `js/skeleton/base/baseAnchors.js`: clamped stance/lean/squash so base pose stops feeding giant triangle legs.
- `js/skeleton/base/baseLimbs.js`: calmer default arms/legs with less spread.
- `js/render/fighters.js`: limbs render behind the body; body mass covers awkward joints.
- `js/render/fighter/limbs/limbs.js`: reduced neon skeleton dominance.
- `js/render/ui.js`: mobile HUD now shows one tiny hero card, small bot chips, and tiny beacons only.

## Verification
Ran:
`node .sim/charge-rapid-separation-probe.mjs && node .sim/anatomy-guard-probe.mjs && node .sim/skeleton-pose-probe.mjs && node .sim/animation-gait-probe.mjs && node .sim/rapid-fairness-probe.mjs`

Result: exit code 0.

## Honest note
This is a larger visual direction change, but it still needs fresh phone screenshots. If it still looks bad after this, the next move should be to replace the procedural skeleton with a dedicated simple capsule-sprite fighter renderer, not keep trying to refine the skeleton.
