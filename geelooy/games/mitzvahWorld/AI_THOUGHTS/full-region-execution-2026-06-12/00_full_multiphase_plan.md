B'H
# Full Region Execution Diary — Full Multi Phase Plan

The user corrected the mission: do not merely interpret, do not stop at skeletons, implement the plan as real in-game systems. This diary will be updated after every phase and after every ~15 files.

## Phase 1 — Inspection and safe interfaces
Read the octree/collider APIs, existing terrain law, existing postbuild layers, and existing material APIs. Identify safe ways to add visuals and colliders without corrupting collision.

## Phase 2 — Living garden renderer core
Create actual runtime render helpers for terrain grounding, deterministic placement, shared geometries/materials, instanced meshes, and group sealing. This is the root of real visible content.

## Phase 3 — Actual biome layers
Implement visible InstancedMesh/mesh layers for:
- dense grass fields
- flowers and wildflowers
- bushes/shrubs
- rocks/moss/mushrooms
- yellow brick roads and dirt trails
- wheat fields and vegetable gardens
- orchards and forests
- lamps/landmarks
These must be grounded and visual-only unless otherwise classified.

## Phase 4 — Wildlife runtime layer
Add a lightweight visible wildlife simulation: rabbits, foxes, deer, birds, frogs, goats. The first pass should be deterministic, moving, territory-based, and not colliding with the player yet. It must be visual and performant.

## Phase 5 — Collider pipeline
Implement actual collider classification and conservative merged collider creation for necessary hard blockers only: house shells, major rocks, fences/lamps if needed. Add one merged object to octree only if the project API is verified; otherwise produce a mesh/report and skip mutation.

## Phase 6 — Region director integration
Wire all real layers into the postbuild region execution pipeline, return detailed counts, and expose diagnostics.

## Phase 7 — Verification
Run syntax checks, grep cache busts, launch preview, and write audit of what is real vs remaining.

## Implementation principle
No small partial symbolic files. Every module must do a real thing or support a real thing. Everything visible should be grounded. Everything decorative should skip octree/raycast. Hard collision should be deliberately classified, merged, and logged.

Awtsmoos chapter: The skeleton must receive breath. Grass must not be a plan; it must stand. Roads must not be a plan; they must curve. Animals must not be a noun; they must move.