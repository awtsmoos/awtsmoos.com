# B"H — Pose Solver Root Plan

## New evidence from user screenshots
The screenshots show broken source pose geometry: folded triangular legs, arms crossing body, knees snapping above hips, and crab-like sitting poses. That is not only a renderer issue.

## Files inspected in this pass
- `js/skeleton/bindPose.js`: binds pose points directly into bones without anatomical correction.
- `js/skeleton/base/baseAnchors.js`: can amplify squat, stretch, curl, lean, and foot widen.
- `js/skeleton/base/baseLimbs.js`: creates baseline limbs but later influences can distort them.
- `js/skeleton/ik/ikLite.js`: applies arm, leg, head, foot constraints.
- `js/skeleton/ik/legConstraint.js`: current clamp shortens hip-knee and knee-foot independently to `LIMITS.leg.max * .6`, which can pull feet/knees into folded triangles instead of solving a two-bone leg.
- `js/skeleton/ik/armConstraint.js`: same independent clamp problem for arms.
- `js/skeleton/ik/footConstraint.js`: only caps foot y; it does not preserve leg anatomy.

## Root diagnosis
The likely visual bug is independent segment clamping. When a foot or hand target is too far or gets moved by gait/combat influences, the current constraint moves knee/foot/hand independently. This can create impossible triangles. Real two-bone IK should preserve the end target as much as possible, place the middle joint on a controlled bend side, and keep segment lengths plausible.

## Whole-file rewrite plan
- Rewrite `js/skeleton/ik/legConstraint.js` with real two-bone IK and grounded foot protection.
- Rewrite `js/skeleton/ik/armConstraint.js` with similar two-bone IK for arms.
- Rewrite `js/skeleton/ik/footConstraint.js` to stabilize grounded feet and prevent feet being pulled above hip/knee into crab poses.
- Run skeleton probes and add a harsher anatomy probe that checks knee below hip, foot below knee, and limb lengths.
