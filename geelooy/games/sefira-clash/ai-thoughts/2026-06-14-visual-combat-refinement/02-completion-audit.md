# B"H — Completion Audit

## What was changed
- Rewrote `js/render/fighter/body/drawTorso.js` to clamp torso squash and split body mass into chest and abdomen layers.
- Rewrote `js/render/fighter/limbs/drawBoneLine.js` to visually clamp impossible limb stretch and draw smoother curved limb segments.
- Rewrote `js/render/fighter/limbs/drawSkeletonLayer.js` to render layered skeleton strokes and readable joints.
- Rewrote `js/render/fighter/limbs/limbs.js` to reduce over-heavy black strokes and stabilize limb thickness against squash.
- Rewrote `js/data/combatTuning.js` to add rapid push, rapid escape nudge, stronger DI, charged low-percent force, and major-hit stun settings.
- Rewrote `js/physics/knockback.js` so rapid punches shove away with short stun and mobility, while charged major hits get real pop-out force and stun.

## Verification run
Command:
`node .sim/rapid-fairness-probe.mjs && node .sim/skeleton-pose-probe.mjs && node .sim/animation-gait-probe.mjs`

Result: exit code 0.

Rapid result showed defender displaced far away, `stun: 0` at final readout, `rapidMobilityFrames: 10`, and `rapidJailActive: true`, meaning the anti-trap mobility path remained alive.

Additional direct knockback probe:
- Rapid jab at low damage: force 3.59, vx 5.11, stun 1.71, mobility 24.
- Full charge punch at low damage: force 8.4, vx 7.15, stun 29.69.

## Remaining risk
Browser feel still needs human playtesting for exact visual taste, but syntax and simulation probes pass. The known squish source was removed, and rapid/charge mechanics now have measured behavior matching the request.
