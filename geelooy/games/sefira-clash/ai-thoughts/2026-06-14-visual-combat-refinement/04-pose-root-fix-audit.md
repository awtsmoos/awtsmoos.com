# B"H — Pose Root Fix Audit

## Root fix implemented
The folded-body screenshots pointed to source pose corruption. The root suspect was confirmed in `js/skeleton/ik/legConstraint.js` and `js/skeleton/ik/armConstraint.js`: both were independently clamping limb segments instead of solving them as a two-bone chain.

## Whole files rewritten
- `js/skeleton/ik/legConstraint.js`
  - Replaced independent segment clamps with two-bone leg IK.
  - Preserves readable grounded foot targets.
  - Places knees as real hinge points instead of letting them snap into crab triangles.
- `js/skeleton/ik/armConstraint.js`
  - Replaced independent arm clamps with two-bone arm IK.
  - Clamps hand reach and places elbows around shoulder/hand chain.
- `js/skeleton/ik/footConstraint.js`
  - Stabilizes grounded feet against the stage.
  - Prevents feet from rising above knees/hips into folded seated poses.
- `js/skeleton/ik/ikLite.js`
  - Reordered IK so feet stabilize first, legs solve toward stabilized feet, then arms/head solve.
- `.sim/anatomy-guard-probe.mjs`
  - Added anatomy regression guard for idle, walking, hitstun, charge, and rapid poses.

## Verification
Ran:
`node .sim/anatomy-guard-probe.mjs && node .sim/skeleton-pose-probe.mjs && node .sim/animation-gait-probe.mjs && node .sim/rapid-fairness-probe.mjs`

Result: exit code 0.

The anatomy guard found no bad limb lengths, no knees above hips, and no feet above knees in idle, walk, hitstun, charge, or rapid cases.

## Honest status
This is much more likely to fix the screenshots than the first renderer pass, because it attacks the actual IK fold source. Browser playtest is still the final judge, but now the automated guard specifically protects against the crab/fold shapes shown before.
