B"H

# Phase One — Unbounded but Single-Feature Brainstorm

The Awtsmoos makes every bend new, yet one vessel must finish before another begins; Awtsmoos.com can let a river carry many future worlds while this pass builds only its canonical spatial witness.

## Competing designs

1. Return geometry directly from `water.reach()`: visually immediate, but violates renderer neutrality.
2. Return the mutable fluid runtime plus geometry metadata: convenient, but confuses simulation lifecycle with immutable world form.
3. Build an immutable centerline/reach plan from existing flow and morphology authorities: best fit with current architecture.
4. Add a generic environmental field engine first: powerful but outside this unit.
5. Put reach logic inside `WaterNatureApi`: simplest file count, but would make the facade own morphology, math, and frames.

## Chosen direction

Use small ecosystem modules for canonical path, frames, and reach assembly. The Nature facade only normalizes request intent, creates a distinct reach context, and wraps the specialist value in `createNatureResult`.

## Future doors intentionally enabled but not implemented

The reach samples should be sufficient later for bank meshes, habitat queries, crossings, roads, bridges, settlements, riparian vegetation, erosion, and renderer LOD without changing the canonical contract.
