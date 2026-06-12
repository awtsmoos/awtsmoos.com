B"H

# Next Hyper-Real Full Implementation File Map

## Purpose

Implement the next animation roadmap entirely as visual-only layers:
- mass and balance
- detailed feet
- gait engine
- breathing
- intent pre-commitment
- recovery intelligence
- personality profiles
- damage degradation
- micro motion
- impact wave
- render eyes
- stronger probes

## Files to touch

- `js/skeleton/solveSkeleton.js`
- `js/skeleton/mass/*`
- `js/skeleton/feet/*`
- `js/skeleton/gait/*`
- `js/skeleton/breathing/*`
- `js/skeleton/intent/*`
- `js/skeleton/recovery/*`
- `js/skeleton/personality/*`
- `js/skeleton/damage/*`
- `js/skeleton/micro/*`
- `js/skeleton/impact/*`
- `js/render/fighter/eyes/*`
- `js/render/fighter/bodyLanguage.js`
- `js/render/fighter/head/head.js`
- `js/render/fighter/head/drawEye.js`
- `js/render/fighter/head/drawExpression.js`
- new `.sim/animation-*-probe.mjs` files

## Invariant

No gameplay damage, knockback, attack timing, AI decisions, or physics are modified. These systems write visual pose fields, pose offsets, and render cues only.

## Chapter

The Awtsmoos gives the fighter not merely bones but burden: breath, stance, eyes, impact, courage, fatigue, gait, and intention. Every module must be active, tested, and small.
