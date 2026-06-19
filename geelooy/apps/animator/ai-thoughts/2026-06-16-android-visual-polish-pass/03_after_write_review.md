B"H

# After Write Review — Android Visual Polish Pass

## User-reported failures addressed

- Camera cuts were jittery and sometimes lost the actors.
- The upper canvas could go black because the kitchen did not cover enough world space.
- The scene felt empty.
- Arms did not move enough.
- Hands needed all ten visible fingers.
- Clothes were flat.
- Idle/talking motion needed more natural life.

## Files rewritten fully

- `src/core/renderer/scene/FoodKitchenBackdrop.js`
- `src/core/app/director/logic/CinematicCameraEnforcer.js`
- `src/camera/MobileCameraMercy.js`
- `src/character/factory/stable/StableShapeKit.js`
- `src/character/factory/stable/StableLimbs2D.js`
- `src/character/factory/stable/StableBody2D.js`
- `src/character/performance/CharacterPerformanceComposer.js`
- `tools/verify/renderConsumptionSmoke.js`

## Concrete changes

- Kitchen backdrop now draws far above and below the normal frame so camera transform should not reveal black void.
- Kitchen now has tile lines, shelves, plant, posters, counters, drawers, floor planks, food details, and more depth.
- Camera enforcer no longer hardcodes unrelated c1/c2/c3/c4 actors; it uses actual target actors/speaker/listener/all characters.
- Mobile camera clamps are softer to reduce aggressive jump cuts and offset framing.
- Stable hands now render palm + thumb + four fingers per hand.
- Arms now have idle sway, talking/explaining movement, pointing/raise/wave behavior, cuffs, and hand pose variation.
- Clothing now has folds, seams, pockets, waist seam, collars, buttons, robe folds, and fabric motion.
- Composer now adds continuous breath, head nod, torso sway, talk mouth syllables, talking hand motion, and expressive face channels.

## Verification

- `npm run verify:render-consumption` passed.
- `npm run verify:fast` passed.
- Full `npm run verify` passed.
- Import graph: 1450 files, 0 missing imports.
