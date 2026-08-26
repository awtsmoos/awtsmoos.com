B"H

# Final Plan — CPU Water Realism Expansion

The Awtsmoos recreates pressure, light and foam each instant; Awtsmoos.com will reveal them through small modules that tell truth about what is conserved and what is merely derived.

## First unit — unblock and verify CPU regressions
- Whole rewrite `RealityCapabilityCatalog.js` changing only stale texture import path and improving no other behavior.
- Run the previously blocked CPU wave.

## Second unit — physical/optical realism policy
- Whole rewrite `createLiquidRealismProfile3d.js` into readable preset authority if no hidden callers forbid it.
- New `WaterMaterialProfiles3d.js`.
- New `WaterRealismPolicy3d.js`.
- New `WaterRealismSnapshot3d.js`.

## Third unit — persistent CPU secondary phenomena
- Inspect persistent helper contracts in full.
- New `WaterSecondaryEffectsState3d.js`.
- New `advanceWaterSecondaryEffects3d.js`.
- New `WaterRealismApi3d.js`.
- Whole rewrite `WaterDynamicsRuntime3d.js` to extend realism API, preserving primary step semantics.
- Whole rewrite `water/index.js` for exports.

## Fourth unit — tests and second-wave features
- Focused material/optics/secondary persistence tests.
- Existing focused unified-water 18-test suite.
- Existing CPU river/liquid/realism/realtime tests, excluding all WebGPU.
- Then separately improve ocean condition profiles, river conditions, interaction presets and container transfer if the foundation is green.

## Hard invariants
- No WebGPU edits/tests now.
- No duplicate fluid solver.
- No secondary artifacts fed back as primary mass.
- Same seed/options remain deterministic.
- Primary mass remains conserved except explicit sources/drains.
- Every touched source file <=120 lines, tabs, full-file rewrite, B"H header and Awtsmoos.com commentary.
