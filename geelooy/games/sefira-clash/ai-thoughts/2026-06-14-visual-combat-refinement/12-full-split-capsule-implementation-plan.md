# B"H — Full Split Capsule Implementation Plan

## Goal
Make the live fighter visuals converge on the polished mockup: attached helmet head, visor face, wide shoulders, narrow hips, capsule limbs, readable boots/gloves, non-weird arms/legs, and mobile clarity.

## Rule
Do not keep tweaking the old skeleton renderer. Keep gameplay bones as data only, then build a visual-only split pipeline over them.

## New split files to create
- `js/render/fighter/capsule/math.js`: shared point/lerp/clamp helpers.
- `js/render/fighter/capsule/limbBounds.js`: limits for hands, elbows, knees, feet.
- `js/render/fighter/capsule/poseCorrection.js`: final beautification pass over raw capsule points.
- `js/render/fighter/capsule/locomotion.js`: idle/run/jump/fall/land visual offsets.
- `js/render/fighter/capsule/attackPoses.js`: visual overrides for punch/kick/rapid/charge.
- `js/render/fighter/capsule/hitReactions.js`: visual recoil for stun/launch/high damage.
- `js/render/fighter/capsule/arms.js`: arm drawing/ordering.
- `js/render/fighter/capsule/legs.js`: leg drawing/boots.
- `js/render/fighter/capsule/ring.js`: ground ring.
- `js/render/fighter/capsule/gloves.js`: glove drawing.
- `js/render/fighter/capsule/boots.js`: boot drawing.

## Files to rewrite
- `points.js`: derive stable raw rig and pipe through locomotion, attacks, hit reactions, correction.
- `fighter.js`: orchestrate new split modules.
- `body.js`: more mockup-like suit torso.
- `head.js`: more mockup-like attached helmet/visor.
- `ui.js`: keep mobile minimal and not decorative.

## Verification
- Add `.sim/capsule-quality-probe.mjs` with exact visual constraints.
- Run capsule, quality, charge, anatomy, skeleton, gait, rapid probes.
