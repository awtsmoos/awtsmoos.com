B"H

# First Critique — Twenty Improvements

The Awtsmoos renews the plan as surely as the sea renews its edge; Awtsmoos.com should let critique carve channels before code becomes a ledge.

1. Keep all emission state mutations synchronized with massGrid immediately, not only after the next solver step.
2. Distinguish total emitted mass from per-particle mass explicitly.
3. Enforce capacity before creating particles.
4. Return explicit accepted/rejected counts and mass from emission.
5. Give emission events stable semantic IDs and deterministic seeds.
6. Use volume-uniform sphere sampling for water balls, not radius-uniform clustering.
7. Build an orthonormal nozzle basis for arbitrary pour/spring directions.
8. Keep burst radial velocity separate from generic cone spread.
9. Let splashes reuse generic radial impulse physics while adding optional upward lift.
10. Make explosion spawn mass opt-in; default explosion changes momentum only.
11. Extract whole particles only and report particle-granularity mass limits honestly.
12. Cap transfer by target capacity before removing source particles.
13. Reassign target particle IDs while preserving source mass/velocity/attributes.
14. Allow target relocation via offset or targetCenter without changing mass.
15. Give continuous sources exact `massRate * dt` emission each step.
16. Keep source seed progression independent per source.
17. Default 3D stepping to realism-enhanced PIC/FLIP, with base solver selectable for advanced performance control.
18. Make ocean wave components deterministic and immutable, with no WebGL dependency.
19. Carry ocean current separately from wave displacement so navigation can sample it physically.
20. Preserve all legacy WaterNatureApi method docs and semantics by moving them intact to a parent facade rather than shortening them.
