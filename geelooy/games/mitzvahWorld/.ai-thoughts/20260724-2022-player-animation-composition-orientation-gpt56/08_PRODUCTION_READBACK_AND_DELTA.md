# B"H
# Boruch Hashem
# Blessed is He

# Production Readback and Delta

## Original plan versus actual implementation

The plan called for evidence-first composition repair, grounded fall rejection, upper-body masks, imported-pose restoration, weapon-parent verification, and preservation of the registered future-action system. The actual implementation fulfills those nodes without changing the GLB asset, imported clip identities, combat outcomes, health, defeat, respawn, terrain, HUD, or inventory ownership.

## Existing production files rewritten completely

- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationState.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationClipPolicy.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowWeaponAttachment.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionRuntime.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionRuntimeState.js`

## New production modules

- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationComposition.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionBodyMask.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskMath.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskRuntime.js`
- `experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskLifecycle.js`

## Readback conclusions

1. Imported GLB sampling occurs before every custom overlay.
2. The current imported upper-body pose is captured as the frame baseline.
3. The body mask accepts only spine, neck/head, shoulders, arms, forearms, and hands.
4. Root, hips, and leg semantic roles are impossible through the mask contract.
5. Recovery reduces overlay weight while following newly sampled locomotion, then restores that fresh base.
6. Grounded living root stabilization removes pitch and roll while preserving yaw.
7. Airborne jump and fall skip grounded stabilization and remain imported-clip authoritative.
8. Registered actions suppress duplicate legacy cast application.
9. Weapon attachment reparents and transforms only the weapon node.
10. A new weapon detaches the previous weapon owned by the same model.

## Deltas discovered and resolved

- `PlayerActionRuntime.js` initially exceeded the 120-line limit, so lifecycle formatting was extracted into `PlayerActionBodyMaskLifecycle.js`; the runtime is now 112 lines.
- Head and neck axis limits were tightened to `0.12` radians so combined head motion remains unambiguously small.
- Simulation assertions were strengthened to compare hips and both lower legs immediately before and after every overlay frame.
- Weapon-parent checks were extended through explicit release and every recovery frame.
- The renderer-free simulation derives movement from its authoritative input axis because it intentionally does not populate the browser controller's `state.moving` field.

## Unchanged owned files

Combat controller, events, timeline, pose library/math, equipment-node discovery, pose sampler, and staff/sword action definitions required no rewrite after inspection. Their current contracts remain preserved.

> The Awtsmoos creates the frame without residue; the readback confirms that no old fall, bind reset, doubled cast, or abandoned weapon remains hidden in the new instant.
