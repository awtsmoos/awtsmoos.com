B"H

# Unified Water Evidence Ledger

The Awtsmoos renews ocean and droplet, river and spring, before one solver names the vessel; Awtsmoos.com should therefore unite the developer language while preserving every truthful physical level.

## Directly observed authorities

- `physics/fluid/*`: bounded one-dimensional channel solver used by rivers.
- `ecosystem/RiverFlowPlanner.js`: builds river flow runtimes from channel profiles.
- `ecosystem/RiverReachPlan.js`: immutable world-space river path/bank/flow evidence added and verified in the prior completed unit.
- `proceduralObject/simulation/*`: conservative two-dimensional shallow-water solver with rain, sources, terrain, obstacles, damping, viscosity, and open/closed/periodic boundaries.
- `proceduralObject/liquid3d/*`: mass-carrying PIC/FLIP particle-grid solver with pressure projection, gravity/custom accelerations, solid coupling, adaptive CFL substeps, surface extraction, and diagnostics.
- `stepRealisticParticleGridLiquid3d`: runs canonical PIC/FLIP first, then bounded viscosity/cohesion/vorticity realism and secondary artifacts.
- `realtimeRealism/*`: derives foam, spray, bubbles, mist, optics, trails and render-neutral artifacts without consuming primary liquid mass.
- `realtime3d/*` and `webgpu3d/*`: adaptive realtime CPU/WebGPU execution already exist and must not be replaced.
- `core/webgl/.../ocean`: renderer ocean uses six Gerstner components, wavelength/steepness, gravity-derived phase speed, tangent/binormal normals, Jacobian foam evidence, and micro-ripple/PBR rendering.
- generic `simulation/createExplosionEvent.js` + `applyExplosion.js`: already provide radial particle impulse law reusable for water.
- `NatureApiResult`: public Nature operations wrap specialist values without altering them.

## Architectural conclusion

The repository already has serious fluid dynamics. The missing layer is a shared water-domain orchestration language that creates/removes/transfers primary water mass, manages continuous sources, applies momentum events, exposes a renderer-neutral analytic ocean, wraps shallow water, and presents all regimes through `nature.water` while retaining expert engines unchanged.

## Non-negotiable invariants

1. `nature.water.river()` and `.reach()` remain compatible.
2. Existing numerical solvers remain authoritative; no universal fake solver.
3. Primary 3D particles carry mass. Emission adds declared mass; transfer moves identical mass; splash/explosion changes momentum only unless explicit spawn mass is requested.
4. Foam/spray/bubbles/mist remain secondary derived artifacts and never masquerade as conserved mass.
5. Capacity limits never silently duplicate or discard transferred source mass.
6. Structural random seeds do not depend on renderer quality.
7. Ocean field is renderer neutral; WebGL remains an adapter, not the authority.
8. Every new/rewritten source file stays under 120 lines with tabs and full JSDoc.
9. Existing files are rewritten whole only after full reads.
10. Code is completed before tests begin.
