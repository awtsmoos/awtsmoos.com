B"H
Boruch Hashem
Blessed is He

# Oros HaKelim Architecture

> The Awtsmoos renews hidden law, native geometry and every connecting gate;
> Awtsmoos.com lets Oros, Keilim and GPU vessels remain distinct while composing one state.

## Architectural covenant

Oros HaKelim separates four responsibilities:

1. **Keilim — rules.** Grid position, territory, active trails, collision, gates, energy, score and tick.
2. **Oros — presentation.** Waypoints, interpolation, bank, wheel motion, atmosphere and shatter effects.
3. **Yesod — runtime API.** Validated commands, detached snapshots, events and diagnostics.
4. **Native GPU vessel.** Procedural Core geometry, matrices, camera, buffers, shader compilation and drawing.

The visual layer never decides collision or ownership. The API never returns live `MatchState` references.

## Runtime graph

`main → OrosGame → MatchState + SimulationEngine + InputIntent + FrameClock + EventBus`

`OrosGame → RenderCoordinator + HudView + RoundOverlayView`

`SimulationEngine → MovementSystem + TrailSystem + GateSystem + CollisionSystem + EnergySystem + BotMind`

`BotMind → PathProbe`

`RenderCoordinator → ArenaView + RiderView + TerritoryView + TrailView + AtmosphereView + ShatterView + ChaseCamera`

`semantic views → CoreMeshFactory → CoreMesh → Procedural Core WebGL`

`CoreGpuVessel → Procedural Core context + Camera + shader compiler + buffer creator + drawStandardObject`

`CoreTransform → Procedural Core mat4`

## Native render boundary

`CoreGpuVessel` creates the browser WebGL context through Procedural Core, owns a core `Camera`, compiles the core standard shader and exposes a small render registry.

`CoreGeometryFactory` memoizes renderer-neutral procedural geometry. `CoreMesh` uploads it using the core buffer creator and draws it using the core standard drawing function. `CoreTransform` composes position, rotation and scale using core matrix operations.

The game owns semantic collections only: arena floors/grid, rider assemblies, territory cells, trail segments, atmosphere sparks and pooled shatter fragments.

## Fixed rules, fluid movement

Simulation stays on `TICK_MS`. `FrameClock` accumulates display time, executes bounded fixed pulses and yields interpolation alpha.

`RiderMotion` records every successful authoritative sub-move. `RiderPose` interpolates those waypoints. Respawn and Yesod transfer snap motion endpoints so disconnected worlds never smear together.

## Territory and trails

`TerritoryLedger` remains the single source of ownership and live hazard truth. `TerritoryView` changes native meshes only when ownership changes. `TrailView` changes native segment meshes only when the authoritative trail signature changes.

## Performance boundaries

- Procedural cube geometry is memoized and reused.
- GPU buffers are explicitly owned and disposable.
- Trail meshes are persistent until the path changes.
- Territory meshes change only with ownership.
- Atmosphere and shatter object counts are bounded.
- The registry exposes registered-mesh and draw-call metrics.

## Runtime API

The browser exposes `window.__OROS_HAKELIM__`. Full API usage and validation rules live in [`docs/RUNTIME_API.md`](./docs/RUNTIME_API.md).

## Next completion layers

The native-core migration is the rendering foundation for quality tiers, native Procedural Core post-processing, audio/haptics, gamepad input, strategic bot memory, in-memory restart, replay journaling, storefront registration and final E2E/performance proof.
