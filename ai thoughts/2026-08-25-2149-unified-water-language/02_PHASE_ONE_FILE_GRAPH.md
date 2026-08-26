B"H

# Phase One — Theoretical File Graph

The Awtsmoos is one while our files are many; Awtsmoos.com should divide responsibility so every future wave can find its proper shore.

## New core water modules considered

- `src/core/water/WaterVector3.js` — vector normalization/basis helpers.
- `src/core/water/WaterEmissionPresets.js` — droplet/ball/pour/spring/jet/rain/burst defaults.
- `src/core/water/createWaterEmissionSpec.js` — normalize mass/count/shape/direction/seed.
- `src/core/water/sampleWaterEmission3d.js` — deterministic volume/disk/cone/radial samples.
- `src/core/water/emitWaterParticles3d.js` — append primary particles under capacity and rebuild grid mass.
- `src/core/water/rebuildWaterLiquidState3d.js` — particle-to-grid reconciliation after external state mutation.
- `src/core/water/WaterParcel3d.js` — immutable extracted primary-mass parcel.
- `src/core/water/extractWaterParcel3d.js` — spatial/count/mass-bounded extraction.
- `src/core/water/transferWaterParcel3d.js` — capacity-safe mass transfer between runtimes.
- `src/core/water/applyWaterImpulse3d.js` — splash/explosion momentum without mass mutation.
- `src/core/water/WaterSourceRegistry3d.js` — continuous spring/pour/jet/rain source lifecycle.
- `src/core/water/WaterDynamicsRuntime3d.js` — simple stateful API above realistic PIC/FLIP.
- `src/core/water/ShallowWaterRuntime.js` — simple stateful wrapper around existing 2D solver.
- `src/core/water/createOceanWaveSpectrum.js` — deterministic renderer-neutral wave components.
- `src/core/water/OceanWaveField.js` — sample displacement/height/normal/velocity/Jacobian/tide/current.
- `src/core/water/index.js` — internal expert barrel.

## Nature API modules

- `src/core/natureApi/WaterFlowNatureApi.js` — move the already-verified river/reach/channel/preset methods without changing behavior.
- `src/core/natureApi/WaterNatureFactories.js` — Nature contexts/results for fluid, shallow and ocean.
- full rewrite `src/core/natureApi/WaterNatureApi.js` — extend WaterFlowNatureApi and add `fluid`, `dynamics`, `shallow`, `ocean`, `create`.

## Existing files intentionally avoided

- PIC/FLIP solver internals.
- realtime/WebGPU solver internals.
- shallow finite-volume kernels.
- WebGL ocean shaders.
- package root `src/index.js`.
- universal/MitzvahWorld API definitions until the unified core is verified.
