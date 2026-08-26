B"H

# Phase Two — Tiferes Synthesis

The Awtsmoos joins force with boundary, and Awtsmoos.com can now reveal a water architecture where simplicity above rests on specialist truth below.

## Layer 1 — Conservation vocabulary

Primary particles and parcels are the conserved 3D mass language. Every external mutation rebuilds grid mass/velocity from particles immediately. Reports expose requested, accepted, rejected and transferred mass.

## Layer 2 — Interaction vocabulary

Emission presets create declarative droplets, balls, pours, springs, jets, rain and bursts. Impulse operations create splash/explosion momentum. Parcel operations create drain/transfer semantics.

## Layer 3 — Runtime vocabulary

`WaterDynamicsRuntime3d` owns mutable orchestration state, source lifecycle, stepping, reports and convenience verbs while delegating physics to existing PIC/FLIP/realism functions.

`ShallowWaterRuntime` owns mutable convenience state and source/rain controls while delegating every timestep to the existing finite-volume shallow solver.

`OceanWaveField` owns no timestep state; it deterministically samples an analytic Gerstner+tide+current field at arbitrary time.

## Layer 4 — Developer facade

`nature.water` remains one discoverable entrance:

- `.river()`
- `.reach()`
- `.channel()`
- `.fluid()` / `.dynamics()`
- `.shallow()`
- `.ocean()`
- `.create(kind, options)`

The dynamic result value then speaks the natural verbs:

- `.droplets()`
- `.ball()`
- `.pour()`
- `.spring()`
- `.jet()`
- `.rain()`
- `.splash()`
- `.explode()`
- `.source()` / `.stopSource()`
- `.drain()`
- `.transferTo()`
- `.step()`
