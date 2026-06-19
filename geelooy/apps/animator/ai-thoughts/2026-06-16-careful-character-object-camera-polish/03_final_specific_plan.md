B"H

# Final Specific Plan

Actual touched files:

- `src/data/scenes/healthyLunch/characters.js`: restore a clean two-character cast; remove food-mascot fake people from the default scene so food stays object/prop based.
- `src/data/scenes/healthyLunch/props.js`: smaller, stronger food props with stable table-plane coordinates.
- `src/data/scenes/healthyLunch/cameras.js`: safer camera zooms and targetActor metadata for real focus.
- `src/data/scenes/healthyLunch/beats.js`: gentler food motion and camera transitions.
- `src/core/app/director/logic/PropProcessor.js`: reduce wild prop arcs and rotations.
- `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`: recognize targetActors / healthy-lunch camera IDs instead of defaulting to old c2_speaker ids.
- `src/scene/render/production/ProductionLunchScene.js`: background only; no giant duplicate food/plate behind actors.
- `src/core/app/DefaultSceneInstaller.js`: version bump.
- `tools/verify/carefulPolishSmoke.js`: verify no mascot crowd, safe zooms, speech retained, props restrained.
- `package.json`: add smoke test.

The character renderer remains untouched. This preserves mouth/blink/limb systems.
