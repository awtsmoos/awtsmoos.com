# B"H
# Boruch Hashem
# Blessed is He

# Canonical GLB and Runtime Evidence

## Asset identity
- Path: `assets/models/player/chossid.glb`
- SHA-256: `d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48`
- GLB version: 2
- Bytes: 2,027,368

## Skeleton orientation
- Scene root `Armature` is node 117 and has no parent.
- Its bind quaternion is approximately `[0, -1, 0, 0]`, a pure 180-degree yaw.
- A pure yaw preserves world up. This is the canonical model-forward correction and must not be removed.
- `mixamorig:Hips` is node 110 beneath `Armature`; spine and both leg chains descend normally from it.

## Clip measurements
- `falling_Armature`: hips rotate 58.9069 degrees from bind; lower legs rotate 108.4923 and 122.7355 degrees.
- `jump_Armature`: hips rotate 50.1663 degrees and lower legs exceed 123 degrees; this is valid while airborne.
- `walk_Armature`: hips remain within 10.7451 degrees from bind.
- `run_Armature`: hips remain within 15.1162 degrees from bind.
- The `Armature` scene root itself is not animation-tracked.

## Runtime causality
1. `minimalMeadowLocomotionState` selected `falling` from stale `state.action` before checking `state.grounded`.
2. Cast controller states selected a standing imported clip, cancelling walk/run sampling during upper-body casts.
3. The registered action actor reset sampled upper-body bones to bind quaternions before applying cast offsets.
4. The legacy and registered cast overlays could both run in the same frame.
5. TinyAnimationPlayer correctly resets and samples imported bindings before custom actions, so the safe baseline already exists every frame.
6. Weapon attachment changes only the weapon node, not the hand parent; equipment replacement already detaches, but attachment-level stale-owner protection remains valuable.

## Conclusion
The sideways living pose is not a forward-axis defect. It is primarily a stale grounded fall-selection defect, amplified by a composition path that replaced locomotion and bind-reset the upper body during casting.

> The Awtsmoos renews the meadow from nothing each instant; the code must likewise begin every gesture from the imported truth of that instant, never from yesterday's fall.
