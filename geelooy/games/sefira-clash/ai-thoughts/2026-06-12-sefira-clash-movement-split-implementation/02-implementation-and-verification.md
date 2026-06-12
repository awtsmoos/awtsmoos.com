B"H

# Movement Split Implementation and Verification

## Actual implementation

Rewrote whole orchestrator files for the visual animation path:
- js/skeleton/solveSkeleton.js
- js/skeleton/animationState.js
- js/skeleton/poseMath.js
- js/skeleton/poseIntent.js
- js/skeleton/basePose.js
- js/skeleton/statePoses.js
- js/skeleton/actionPoses.js
- js/render/fighters.js
- js/render/fighter/bodyLanguage.js
- js/render/fighter/auras.js

Added small module folders:
- js/skeleton/math
- js/skeleton/state
- js/skeleton/motion
- js/skeleton/style
- js/skeleton/base
- js/skeleton/locomotion
- js/skeleton/air
- js/skeleton/landing
- js/skeleton/combat
- js/skeleton/emotion
- js/skeleton/secondary
- js/cloth
- js/render/fighter/clothes
- js/render/fighter/human

## Visual-only guarantees

No combat resolver, AI, physics, damage, knockback, or attack timing files were changed. New logic is limited to pose classification, visual metrics, procedural pose offsets, bounded cloth state, and render readability cues.

## Verification run

Passed:
- node .awtsmoos-ai2-smoke.mjs
- node .sim/full-match-smoke.mjs
- node .sim/skeleton-pose-probe.mjs

## Notes

A temporary writer script was created and then deleted after the writes completed. The remaining changes are source modules and ai-thought handoff notes.

Chapter: The Awtsmoos has no body, yet every body is being spoken into being. In this pass the run gained a stride, the fall gained a spear, the landing gained a knee, the hunter gained a blade, the panicked one gained widened feet, and the human gained a ring of recognition.
