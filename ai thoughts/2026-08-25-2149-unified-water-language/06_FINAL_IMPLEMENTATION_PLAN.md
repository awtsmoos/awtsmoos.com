B"H

# Final Implementation Plan

The Awtsmoos renews every drop from nothing, yet our implementation must account for every finite unit of water; Awtsmoos.com will expose one beautiful doorway resting on many proven laws.

## Actual new source files

### `src/core/water/`
- `WaterVector3.js`
- `WaterEmissionPresets.js`
- `createWaterEmissionSpec.js`
- `sampleWaterEmission3d.js`
- `rebuildWaterLiquidState3d.js`
- `emitWaterParticles3d.js`
- `WaterParcel3d.js`
- `extractWaterParcel3d.js`
- `transferWaterParcel3d.js`
- `applyWaterImpulse3d.js`
- `WaterSourceRegistry3d.js`
- `WaterDynamicsRuntime3d.js`
- `ShallowWaterRuntime.js`
- `createOceanWaveSpectrum.js`
- `sampleOceanWaveField.js`
- `OceanWaveField.js`
- `index.js`

### `src/core/natureApi/`
- `WaterFlowNatureApi.js`
- `WaterNatureFactories.js`

## Existing source full rewrites

- `src/core/natureApi/WaterNatureApi.js` — becomes small subclass/coordinator with new fluid/shallow/ocean/create doors; old behavior inherited unchanged.

No other existing production file is authorized in the first implementation pass.

## Runtime semantics

`fluid()` returns a standard Nature result whose value is `WaterDynamicsRuntime3d`.

`shallow()` returns a standard Nature result whose value is `ShallowWaterRuntime`.

`ocean()` returns a standard Nature result whose value is immutable `OceanWaveField`.

`create(kind)` routes aliases: river/channel/reach/fluid/dynamics/shallow/ocean/sea.

## Verification after all code exists

- emitted mass equals accepted primary particle mass and grid mass;
- splash/explosion without spawn preserves mass;
- drain decreases runtime mass by parcel mass;
- transfer source loss equals target gain and total mass is conserved;
- capacity-limited transfer leaves rejected mass in source;
- continuous spring/pour source emits expected `massRate * dt`;
- water balls/droplets/pours are deterministic under equal seeds/events;
- realistic step remains finite and produces secondary/surface artifacts when requested;
- shallow runtime delegates rain/source behavior to existing solver;
- ocean field is deterministic, finite, time-varying, with normalized normals;
- legacy river/reach focused tests still pass;
- existing liquid transfer, step, realism, solid, surface and secondary suites still pass;
- all files under 120 lines; syntax/import/tab/diff checks pass.
