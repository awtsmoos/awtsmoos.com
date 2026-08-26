B"H

# 07 — First Pass Planned vs Actual Delta

The Awtsmoos renews the sea after every wave, and Awtsmoos.com lets readback expose what first sight concealed; this delta records only observed defects or justified user-language improvements before the second whole-file pass is sealed.

## First-pass implementation achieved

- Shared deterministic water vector and nozzle-basis helpers.
- Declarative droplet/ball/pour/spring/jet/rain/burst emission presets.
- Explicit requested/accepted/rejected primary mass accounting.
- Immediate particle-to-grid reconciliation after external 3D state mutation.
- Immutable extracted water parcels with weighted centroid and exact particle mass.
- Capacity-safe source→target particle transfer without copy semantics.
- Mass-preserving splash/explosion impulses.
- Continuous deterministic sources with no hidden timers.
- Stateful 3D runtime delegating to existing PIC/FLIP or realism-enhanced solver.
- Stateful shallow-water runtime delegating to existing finite-volume solver.
- Renderer-neutral deterministic Gerstner ocean spectrum and analytic sampler.
- Unified `nature.water` facade preserving river/reach behavior by inheritance.
- Every first-pass file remained below 120 lines.

## D1 — Runtime contains compressed one-line methods

`WaterDynamicsRuntime3d.js` contains one-line getters and one-line convenience verbs. This violates the no-compressed-function constitution even though the file is under 120 lines.

Resolution: create `WaterDynamicsEmitterApi3d.js` as a focused base class for state getters, one-shot emission verbs, source lifecycle, and event sequencing. Fully rewrite `WaterDynamicsRuntime3d.js` to extend it and retain interaction/transfer/step responsibilities with expanded methods and JSDocs.

## D2 — Source snapshots expose nested mutable options

`WaterSourceRegistry3d.list()` freezes the outer source snapshot but the nested `options` object remains shared/mutable.

Resolution: fully rewrite registry so public snapshots clone/freeze options. Internal source records remain private mutable simulation state.

## D3 — Explicit source ids do not advance a clean ordinal

The first registry increments `nextId` only when auto-generating an id, yet seed derivation depends on that counter. Explicit ids can therefore reuse an ordinal-derived seed unexpectedly.

Resolution: allocate one ordinal on every add, then derive both auto id and default seed from that ordinal.

## D4 — Ocean authored two-component directions are misread

The first spectrum passes `[x,z]` through a 3D vector normalizer, which interprets the second component as Y and then discards it when producing the horizontal `[x,z]` direction.

Resolution: add explicit horizontal direction normalization supporting both `[x,z]` and `[x,y,z]`, then fully rewrite `createOceanWaveSpectrum.js`.

## D5 — Explosion telemetry hides explicitly spawned mass

`explode({spawnMass})` performs a burst emission and then returns only the impulse report. Physics remains correct, but the caller cannot audit the added mass from the explosion result.

Resolution: return a frozen composite report containing `spawn`, `impulse`, and resulting `primaryMass`.

## D6 — Continuous source emission reports are discarded

During `.step(dt)`, source emissions are applied but their requested/accepted/rejected mass reports disappear.

Resolution: preserve a frozen `lastSourceReports` collection and expose it through an expanded getter.

## D7 — The user requested richer natural language than the first runtime exposes

The first runtime has `spring`, `pour`, `jet`, and `rain`, but not the direct semantic aliases requested/implied by the mission such as wellspring, fountain, waterfall, and hose.

Resolution: place semantic aliases in `WaterDynamicsEmitterApi3d`: `wellspring()` and `fountain()` register continuous spring/jet sources; `waterfall()` registers a continuous pour; `hose()` registers a continuous jet. Keep original low-level verbs unchanged.

## D8 — Unified Nature facade routing is too compressed

`WaterNatureApi.create()` uses one-line branch returns. It is readable but conflicts with the repository's anti-compression standard.

Resolution: fully rewrite the small facade with expanded routing and direct aliases `liquid`, `flood`, and `puddle`.

## Confirmed non-deltas

- Shallow default grids are valid because canonical `createScalarGrid2d` / `createVectorGrid2d` zero-fill omitted values.
- 3D primary particle mass is explicit and grid rebuild uses the existing canonical transfer authority.
- Splash/explosion impulses preserve mass unless spawn mass is explicitly authored.
- Transfer caps target capacity before source extraction.
- Ocean analytic time derivatives have the correct sign for the chosen phase convention.
- Tide period has a positive floor and tide/current remain independent from wave displacement.
- No solver internals require replacement.

## Second-pass authorized files

New:
- `src/core/water/WaterDynamicsEmitterApi3d.js`

Full rewrites:
- `src/core/water/WaterDynamicsRuntime3d.js`
- `src/core/water/WaterSourceRegistry3d.js`
- `src/core/water/createOceanWaveSpectrum.js`
- `src/core/water/index.js`
- `src/core/natureApi/WaterNatureApi.js`

No tests until this pass is written and reread.
