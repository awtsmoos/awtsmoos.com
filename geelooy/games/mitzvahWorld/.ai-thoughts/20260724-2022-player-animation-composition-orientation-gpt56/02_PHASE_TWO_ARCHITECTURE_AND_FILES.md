# B"H
# Boruch Hashem
# Blessed is He

# Phase Two: Architecture and File Map

## Proposed responsibility boundaries

### Imported pose authority
- `PlayerActionPoseSampler.js`: sample a deterministic action pose without accumulation.
- `PlayerActionRuntime.js`: sequence imported base sampling before registered overlays.
- `PlayerActionRuntimeState.js`: own phase, cancellation, and recovery state only.

### Body masking
- New `PlayerActionBodyMask*.js`: define semantic upper-body allowlists and forbid root, hips, and legs.
- `StaffCastAction.js` and `SwordCastAction.js`: emit only masked spine/shoulder/arm/hand/head channels.

### Meadow composition
- New `MinimalMeadowAnimationComposition*.js`: compose imported locomotion, registered overlay, and grounded root safety in explicit order.
- Existing animation state/policy/controller/timeline/events: keep state selection, priority, and transitions finite and grounded-aware.

### Pose math
- `MinimalMeadowPlayerPoseMath.js`: pure normalized quaternion operations and shortest-path interpolation.
- `MinimalMeadowPlayerPoseLibrary.js`: semantic pose data only; no whole-model transforms.

### Equipment
- `MinimalMeadowWeaponAttachment.js`: attach the weapon node without mutating the hand parent transform.
- `MinimalMeadowEquipmentNodes.js`: guarantee one active weapon attachment and detach stale nodes on switch.

## Files to inspect before deciding writes
All fourteen owned production files, their importers/callers, TinyAnimationPlayer, hydration/model-orientation code, GLB parsing utilities, focused prior tests, and the canonical GLB binary.

## Planned test families
- playerActions: mask semantics, sampling idempotence, cancellation recovery, leg continuity.
- app: state/clip grounding, root-up tolerance, weapon attachment identity, locomotion-plus-cast composition.
- simulation: idle/walk/run/jump/fall/land and stationary/walking/running casts over time.

## Non-goals
No combat outcome changes, no inventory ownership changes, no visual-world work, and no global model reorientation unless canonical GLB evidence proves the current setup wrong.
