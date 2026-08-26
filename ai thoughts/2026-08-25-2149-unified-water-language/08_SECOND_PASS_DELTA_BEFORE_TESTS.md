B"H

# 08 — Second Pass Delta Before Tests

The Awtsmoos renews vessel, water, and destination together; Awtsmoos.com lets this second readback expose the last seams where a beautiful API could still betray the physics beneath its name.

## Second-pass achievements confirmed by full readback

- Runtime responsibilities are split into emitter, source, and dynamics layers with expanded methods and JSDoc.
- Source ordinals advance consistently for explicit and automatic ids.
- Explosion telemetry exposes spawned mass and impulse separately.
- Continuous source reports remain inspectable after each step.
- Wellspring, fountain, waterfall, and hose aliases delegate to the same source registry rather than separate physics.
- Ocean authored `[x,z]` and `[x,y,z]` directions now normalize correctly.
- Unified Nature routing is expanded and readable.
- Every source file remains below 120 lines.
- Nature seed lineage is confirmed numeric and compatible with the direct runtime seed field.

## D9 — Simple default emissions can begin at the lower grid boundary

The default PIC/FLIP grid begins at Y=0 while an emission with no position defaults to `[0,0,0]`. Spherical droplets or water balls can therefore place part of their primary mass outside the grid immediately, making particle mass and grid mass disagree before the solver has even stepped.

Resolution:
- add `WaterGridPlacement3d.js` with a canonical interior-center helper derived from grid origin/dimensions/cell size;
- enlarge the practical default X/Z grid from 4m to 6m so the default 2.5m rain disk fits with margin;
- make one-shot runtime emissions use the grid interior center when callers omit position/center;
- make continuous sources inherit the same interior default.

## D10 — Default splash/explosion center no longer follows default emitted water

Once default emission moves to the grid interior, zero-argument splash/explosion would still target world origin through the low-level impulse helper.

Resolution: runtime splash/explosion inject the current grid interior center when callers omit center/position. Low-level `applyWaterImpulse3d` remains explicit and renderer neutral.

## D11 — Zero-configuration transfer can preserve coordinates outside a different target vessel

Raw parcel transfer correctly preserves world positions, but a simple `runtime.transferTo(target)` between differently placed grids may produce target particles outside the target grid.

Resolution: runtime-level transfer defaults `targetCenter` to the target grid interior center unless caller supplied `targetCenter` or explicit offset. Expert `transferWaterParcel3d` keeps its lower-level coordinate-preserving semantics.

## D12 — Source option freezing is still only shallow for nested vectors/attributes

Second-pass registry freezes the outer options object, but `direction`, `position`, `center`, or nested attributes may still share caller-owned arrays/objects.

Resolution: add `freezeWaterValue.js`, a small recursive clone-and-freeze helper for arrays and plain records. Use it for source options and emission attributes/parcel metadata so public deterministic configuration cannot be mutated behind the runtime's back.

## D13 — A few compact early-return conditionals remain in new modules

The anti-compression audit found compact `if (...) return ...` statements in `WaterParcel3d.js` and `sampleWaterEmission3d.js`; manual readback also showed the same style in a few normalization helpers.

Resolution: whole-file rewrite the affected new modules with explicit blocks while preserving behavior and comments. No comments are reduced to fit.

## Final pre-test authorized changes

New:
- `src/core/water/WaterGridPlacement3d.js`
- `src/core/water/freezeWaterValue.js`

Whole-file rewrites:
- `src/core/water/createWaterDynamicsState3d.js`
- `src/core/water/WaterDynamicsEmitterApi3d.js`
- `src/core/water/WaterDynamicsSourceApi3d.js`
- `src/core/water/WaterDynamicsRuntime3d.js`
- `src/core/water/WaterSourceRegistry3d.js`
- `src/core/water/createWaterEmissionSpec.js`
- `src/core/water/WaterParcel3d.js`
- `src/core/water/sampleWaterEmission3d.js`
- `src/core/water/emitWaterParticles3d.js`
- `src/core/water/extractWaterParcel3d.js`
- `src/core/water/transferWaterParcel3d.js`
- `src/core/water/WaterVector3.js`
- `src/core/water/index.js`

After this pass: full reread again. If delta is empty, tests begin. No new feature work after that boundary.
