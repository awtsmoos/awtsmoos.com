B"H

# Phase One — File and Authority Map

The Awtsmoos is one while responsibilities are many; Awtsmoos.com keeps each keli small so future rivers need not carve through monoliths.

## Existing authorities to preserve

- `RealityCapabilityCatalog.js` — discovery only; stale texture import repair.
- `RealityTextureChannels.js` — actual live texture channel catalog.
- `liquid3d/createLiquidRealismProfile3d.js` — physical realism preset authority, but cramped and under-described.
- `liquid3d/applyLiquidRealism3d.js` — bounded viscosity/cohesion/vorticity correction.
- `liquid3d/stepRealisticParticleGridLiquid3d.js` — primary realistic step authority.
- `realtimeRealism/createLiquidOpticalProfile3d.js` — renderer-neutral optics.
- `realtimeRealism/createLiquidSecondaryParticleSystems3d.js` — instant spray/foam/bubble/mist derivation.
- persistent realtime helpers — secondary lifetime/dynamics/render artifact authority.
- `water/WaterDynamicsRuntime3d.js` — public stateful primary runtime, already near line ceiling.

## Candidate new water modules

- `WaterMaterialProfiles3d.js` — water-family physical/optical presets.
- `WaterRealismPolicy3d.js` — merges material + realism mode + caller overrides.
- `WaterRealismSnapshot3d.js` — one immutable diagnostics/optics/secondary snapshot.
- `WaterSecondaryEffectsState3d.js` — persistent secondary-only state, never primary mass.
- `advanceWaterSecondaryEffects3d.js` — advances derived systems after primary liquid step.
- `WaterRealismApi3d.js` — small facade layer between source API and dynamics runtime.
- `WaterInteractionPresets3d.js` — splash/plunge/wake/impact presets.
- later: `WaterContainer3d.js`, `WaterTransferPlan3d.js`, ocean/river condition profiles.

## Existing full rewrites likely required

- `RealityCapabilityCatalog.js` only to fix stale import, preserving all behavior.
- `createLiquidRealismProfile3d.js` if expanded, because currently dense one-line records.
- `WaterDynamicsRuntime3d.js` to extend a new realism facade without exceeding 120 lines.
- `water/index.js` for advanced exports.
- `WaterNatureFactories.js` only if material/realism defaults need high-level mapping.
