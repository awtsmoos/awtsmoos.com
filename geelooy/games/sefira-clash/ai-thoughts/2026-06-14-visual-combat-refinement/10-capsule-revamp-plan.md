# B"H — Full Capsule Renderer Revamp Plan

## User evidence
The latest screenshot still shows the exact problem: exposed skeleton geometry, detached head, weird face, bent X-arms, bent legs, and cluttered mobile UI. The user asks to implement the polished mockup direction fully in code.

## Diagnosis
The procedural skeleton should continue to exist for gameplay/pose data, but the visible character should no longer expose raw bones. The visual should be a capsule fighter drawn from a normalized humanoid rig:
- head attached to neck and shoulders
- visor face instead of smiley
- shoulders wider than hips
- arms and legs as tapered capsule segments
- feet planted as boots
- body torso fills the center so limbs no longer cross visually

## Whole-file/module plan
Create new small capsule modules:
- `js/render/fighter/capsule/points.js`: derive stable visual points from f.bones.
- `js/render/fighter/capsule/segment.js`: draw tapered capsule limbs.
- `js/render/fighter/capsule/body.js`: draw torso, neck, pelvis.
- `js/render/fighter/capsule/head.js`: draw attached helmet/visor face.
- `js/render/fighter/capsule/fighter.js`: orchestrate capsule fighter.

Rewrite:
- `js/render/fighters.js` to use capsule renderer instead of exposed limb/body/head stack.
- `js/render/ui.js` again to remove bottom clutter further on mobile: hero chip at left, bot chips tiny top/right, no large bottom bar.

Keep combat fixes intact.

## Verification
Run syntax import check, animation probes, charge/rapid probe. Add capsule points probe to ensure head-neck distance and limb finite points.
