B"H

# Phase One — Chessed: Every Water Possibility

The Awtsmoos pours infinity through finite drops, and Awtsmoos.com may let one API speak of seas and cups without pretending their vessels are the same.

## Five competing architectures

### A — One giant universal solver
Force river, ocean, shallow floods, and droplets through a single grid. Rejected: physically dishonest, expensive, and duplicates mature engines.

### B — Unified facade only
Add method names but no mass/event semantics. Too shallow: `pour()` and `transfer()` would remain cosmetic wrappers.

### C — Shared water-event/mass language above specialist solvers
Create a reusable 3D dynamics runtime, shallow runtime, ocean wave field, source registry, parcel/transfer law, and a small Nature facade. Preferred.

### D — Renderer-first effects engine
Make splash meshes and particle effects without primary fluid state. Rejected: user explicitly requested fluid dynamics.

### E — ECS/world graph first
Model every reservoir, pipe, river and ocean as graph nodes before interactions exist. Powerful future direction, premature for this implementation wave.

## Ideal water language

- Rivers: channel runtime + immutable reach.
- 3D fluid: PIC/FLIP with adaptive realistic stepping.
- Droplets: small primary-mass emissions.
- Water balls: cohesive spherical primary-mass clusters.
- Pouring: nozzle/disk emissions with downward direction and momentum.
- Springs/fountains/jets: upward or authored directional continuous sources.
- Rain: downward distributed sources.
- Splashes: localized momentum impulse applied to existing mass.
- Water explosion: optional spawned burst mass plus radial impulse of existing water.
- Drain: extract a finite parcel without destroying accounting.
- Transfer: remove a parcel from one runtime and inject that exact mass into another, with optional spatial relocation.
- Ocean: deterministic Gerstner spectrum, tide, current, normal, velocity, Jacobian and crest/foam intent.
- Shallow water: mutable convenience runtime around existing finite-volume solver with source/rain controls.
- Advanced users retain direct access to low-level proceduralObject solvers.

## Future doors this foundation should allow

Reservoirs, cups, pipes, pumps, valves, waterfalls, hoses, faucets, buoyancy coupling, boat wakes, shoreline coupling, river-to-ocean discharge, erosion, water temperature/salinity, ice/steam multiphase, rainfall catchment, plumbing, irrigation, dams, tsunami fields, tide-driven estuaries, and renderer adapters.
