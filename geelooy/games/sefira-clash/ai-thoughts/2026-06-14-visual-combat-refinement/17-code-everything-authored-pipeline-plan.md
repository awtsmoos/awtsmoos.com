# B"H — Code Everything Authored Pipeline Plan

## User correction
The user meant: start coding everything, not cutting only. Do not stop until done.

## Remaining implementation target
Replace semi-procedural capsule motion with authored visual poses and stronger mockup style.

## Files to create
- `js/render/fighter/capsule/authored/basePose.js`
- `js/render/fighter/capsule/authored/idlePose.js`
- `js/render/fighter/capsule/authored/runPose.js`
- `js/render/fighter/capsule/authored/airPose.js`
- `js/render/fighter/capsule/authored/attackPose.js`
- `js/render/fighter/capsule/authored/hitPose.js`
- `js/render/fighter/capsule/authored/poseMixer.js`
- `js/render/fighter/capsule/authored/index.js`

## Files to rewrite
- `js/render/fighter/capsule/points.js` to use authored poses.
- `js/render/fighter/capsule/body.js` to become more mockup-like.
- `js/render/fighter/capsule/head.js` to hide smile/look more helmet.
- `js/render/fighter/capsule/arms.js`, `legs.js`, `boots.js`, `gloves.js` for bigger body parts.
- `js/render/fighter/capsule/fighter.js` for stronger glow/shadow order.
- Probes to verify authored poses.

## Done condition
- New authored pose pipeline active.
- Visual timing slow.
- Mobile HUD cut.
- Existing probes pass.
- New authored pose probe passes.
