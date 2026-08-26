B"H

# Phase Two — Tiferes: Realism Without Parallel Physics

The Awtsmoos joins ohr and keli: one conserved liquid beneath many appearances. Awtsmoos.com should let a developer ask for `fresh`, `ocean`, `muddy`, or `extreme` while every request resolves into explicit physical and optical policy.

## Immediate implementation sequence

1. Fix `RealityCapabilityCatalog.js` stale import to `RealityTextureChannels.js` and rerun blocked CPU regression wave.
2. Refactor/expand liquid realism presets into readable profiles with bounded values and explicit secondary thresholds.
3. Add `WaterMaterialProfiles3d` with water-family material presets and clear expert overrides.
4. Add `WaterRealismPolicy3d` that resolves material + solver profile + optics + secondary budgets.
5. Add `WaterRealismSnapshot3d` exposing optics, instantaneous secondaries and useful physical metrics.
6. Add persistent secondary-only state/advance functions using existing advance/merge/compile helpers but never advancing primary PIC/FLIP.
7. Add `WaterRealismApi3d` with simple verbs: `material()`, `setMaterial()`, `realism()`, `appearance()`, `effects()`, `secondaryState`.
8. Rewrite `WaterDynamicsRuntime3d` to extend that layer and update persistent effects after each successful primary step.
9. Export advanced modules from `./water`.
10. Only after code readback, add focused CPU tests and rerun non-WebGPU regressions.
