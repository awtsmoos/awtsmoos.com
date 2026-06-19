B"H

# Careful Character/Object/Camera Polish Plan

The current screenshots are finally back to the complex character renderer, but the scene still looks toy-like and unstable: characters are sometimes tiny, object scale is too loud, props fly through faces, plate/table staging fights the camera, and the mobile UI blocks the lower action. The user specifically asked: improve existing character system without breaking it, make it less unrealistic, stronger objects, and be mindful with camera.

## Rules

- Do not replace the character renderer.
- Do not install fake marker people.
- Do not delete speech/mouth/blink/limb function.
- Touch data and small adapters first.
- Use existing stable character pipeline.
- Keep camera zoom safe, not extreme.

## Files to inspect before writing

- `src/character/factory/stable/StableCharacterRenderAdapter.js`
- `src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js`
- `src/data/scenes/healthyLunch/characters.js`
- `src/data/scenes/healthyLunch/props.js`
- `src/data/scenes/healthyLunch/cameras.js`
- `src/data/scenes/healthyLunch/beats.js`
- `src/core/app/director/logic/PropProcessor.js`
- `src/core/renderer/props/PropBuilder.js`
- `src/core/renderer/pipeline/phases/EntityPhase.js`

## Intended changes

1. Better stage positions/scales: fewer mascot characters, bigger kid/guide, no crowd cluster.
2. Better camera: wide/medium close enough but not violent; reduce insert zoom.
3. Better prop strength: food stays on table plane, smaller and richer, less face collision.
4. Character data improvements only via safe fields/colors/profiles.
5. Verification proving characters/events remain active.
