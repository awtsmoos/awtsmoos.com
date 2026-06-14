# B"H — One-Pass Mockup Convergence Plan

## Goal
Fix the live mismatch shown in screenshots: head still circular/detached, torso too shirt-like, limbs too noodly, boots/gloves too weak, animation too fast, HUD too cluttered.

## Files touched in this pass
- `js/render/fighter/capsule/limbBounds.js`
- `js/render/fighter/capsule/points.js`
- `js/render/fighter/capsule/poseCorrection.js`
- `js/render/fighter/capsule/locomotion.js`
- `js/render/fighter/capsule/attackPoses.js`
- `js/render/fighter/capsule/hitReactions.js`
- `js/render/fighter/capsule/body.js`
- `js/render/fighter/capsule/head.js`
- `js/render/fighter/capsule/arms.js`
- `js/render/fighter/capsule/legs.js`
- `js/render/fighter/capsule/gloves.js`
- `js/render/fighter/capsule/boots.js`
- `js/render/fighter/capsule/fighter.js`
- `js/render/ui.js`
- `style.css`
- `.sim/capsule-quality-probe.mjs`
- `.sim/visual-animation-speed-probe.mjs`

## Target changes
- Bigger helmet, dominant visor, thick neck tucked under head.
- Broad shoulder suit, narrow waist, stronger belt.
- Thicker segmented arms and legs.
- Larger gloves and boots.
- Less backwards collapse and less twitchy motion.
- Slower idle/run visual cycles.
- Slower punch/kick keyframe progression.
- More compact mobile HUD/control footprint.
