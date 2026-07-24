# B"H
# Boruch Hashem
# Blessed is He

# Implementation Decision

## Production rewrites
- `MinimalMeadowAnimationState.js`: explicit imported-base, legacy-overlay, registered-overlay, grounded-root order.
- `MinimalMeadowAnimationClipPolicy.js`: grounded state overrides stale jump/fall action labels.
- `PlayerActionRuntime.js`: use an imported-pose body-mask composer and smooth recovery.
- `PlayerActionRuntimeState.js`: preserve sample progress while release/cancel weight fades.
- `MinimalMeadowWeaponAttachment.js`: enforce one weapon per model owner without touching hand transforms.

## New production modules
- `MinimalMeadowAnimationComposition.js`: chooses locomotion beneath upper-body casts, suppresses duplicate legacy casts, and aligns a living grounded model to world up while preserving yaw.
- `PlayerActionBodyMask.js`: permits only spine, neck/head, shoulders, arms, forearms, and hands.
- `PlayerActionBodyMaskMath.js`: clamps controlled head/spine motion and composes normalized quaternions from a supplied base.
- `PlayerActionBodyMaskRuntime.js`: distinguishes fresh imported samples from the previous frame's overlay, preventing accumulation in both rendered and headless callers.

## Explicit non-changes
- No GLB asset, clip name, clip track, controller event, health, defeat, respawn, balance, terrain, HUD, or ownership rule changes.
- No hips, root, or leg role is accepted by the upper-body mask.
- Genuine airborne jump/fall selection remains authoritative.
- The registry and message-driven future-action API remain unchanged.
