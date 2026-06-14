# B"H — Visual and Combat Refinement Plan

## Phase 1 discovery
Observed project path: `geelooy/games/sefira-clash`; user said `sefira-smash`, but filesystem search found no such directory and found this Sefira game with smash/combat modules.

## Files inspected
- `js/render/fighter/body/drawTorso.js`: torso currently uses `45 / torsoSquash`, so higher squash can visibly collapse the body.
- `js/render/fighter/limbs/limbs.js`: limb renderer draws every bone directly; no smoothing against malformed or overlapping pose points.
- `js/render/fighter/limbs/drawBoneLine.js`: raw root-to-tip strokes can expose twisted/squished skeletons.
- `js/combat/rapidAttack.js`: rapid mode is marked noGlue but currently still uses jab base values.
- `js/physics/knockback.js`: rapid stun is tiny, but repeated rapid hits overwrite velocity and can still feel like prison.
- `js/physics/movement.js`: rapidMobilityFrames already allows movement during rapid hit states.
- `js/combat/startAttack.js`: rapid attacks add tiny self impulse, so rapid punching should not stop the attacker.

## Plan
1. Rewrite visual body torso to clamp squash and render layered chest/abdomen forms instead of a single over-compressed ellipse.
2. Rewrite bone line drawing to clamp impossible limb lengths visually and draw tapered realistic segments.
3. Rewrite limb layer to use distinct shadow/flesh/stroke thickness without over-fat black strokes.
4. Tune rapid knockback to push defenders away per punch, prevent repeated hit glue, and preserve defender mobility.
5. Tune charged punches to create a small knock-out nudge even at low percent, with stun after major attacks.
6. Verify by syntax checking changed modules and running rapid fairness plus skeleton probes.

## Files to rewrite whole
- `js/render/fighter/body/drawTorso.js`
- `js/render/fighter/limbs/drawBoneLine.js`
- `js/render/fighter/limbs/drawSkeletonLayer.js`
- `js/render/fighter/limbs/limbs.js`
- `js/physics/knockback.js`
- `js/data/combatTuning.js`
- `.sim/rapid-fairness-probe.mjs`
