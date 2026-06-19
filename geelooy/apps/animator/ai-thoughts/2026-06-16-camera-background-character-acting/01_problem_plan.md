B"H

# Problem Plan: Camera, Background, Acting

The screenshots reveal the true break:

1. Camera changes actor scale/position, but the kitchen background is screen-fixed, so every shot feels like a crop pasted on a static poster.
2. The counter line and wall do not parallax or follow the world camera. This destroys cinematic continuity.
3. Props are still not stage-bound enough; food floats at face height when camera/staging shifts.
4. Characters retain complex renderer, but acting is too still: talking does mouth only, no head bob, gaze pulses, shoulders, hand emphasis, or idle breathing.
5. Wide shot makes actors too small against too much dead wall.

## Read before editing
- SceneComposer path and renderer stage pipeline.
- Entity/background phase ordering.
- VirtualGraph transform conventions.
- Stable character assembler inputs for expressive fields.
- Face/gesture systems to avoid breaking them.

## Likely touch files
- `src/scene/render/production/ProductionLunchScene.js`: make background world-camera aware instead of screen-fixed; add more anchored kitchen zones.
- `src/core/renderer/pipeline/phases/ScenePhase.js` or whichever phase builds background: pass camera into scene composer.
- `src/scene/core/SceneComposer.js`: accept camera/context cleanly.
- `src/data/scenes/healthyLunch/cameras.js`: better composition, less dead wall.
- `src/data/scenes/healthyLunch/characters.js`: richer expression defaults.
- `src/core/app/director/logic/SpeechProcessor.js`: add non-destructive talk acting signals.
- `src/core/app/director/logic/CharacterProcessor.js`: preserve/compose acting signals.
- `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`: reduce tiny wide scale and sane focus.
- `tools/verify/cameraBackgroundActingSmoke.js`: verify background receives camera, speech acting signal exists, no tiny scales.

No real character renderer replacement.
