B"H

# Restore Real Characters — Truth and Repair Plan

The user is right. The runtime proof scene solved the wrong proof problem by suppressing the existing character/event complexity. The old engine had complex faces, limbs, blinking, mouth function, speech processors, character renderer, bone systems, and director events. The repair must keep the authored scene background while restoring the existing character pipeline and a rich default sequence.

## What must be fixed

1. Do not install empty `characters`.
2. Do not install empty `events`.
3. Do not let the proof scene be the final visual output.
4. Keep SceneComposer authored/kitchen background, but allow EntityPhase to render real characters.
5. Restore `HEALTHY_LUNCH_SCENE.initialCharacters` and events into DefaultSceneInstaller.
6. Remove or shrink proof banner so it does not ruin the cartoon.
7. Verify complex character data is present and sequence has speech/gesture events.

## Files to inspect

- `src/core/renderer/pipeline/phases/EntityPhase.js`
- `src/character/**` relevant render/factory files
- `src/data/scenes/healthyLunch/*.js`
- `src/core/app/director/logic/EventProcessor.js`
- `src/core/app/DefaultSceneInstaller.js`
- `src/scene/render/production/ProductionLunchScene.js`

## Expected final result

A warm authored kitchen/table background plus the existing complex characters with limbs/faces/mouth animation restored by active sequence events.
