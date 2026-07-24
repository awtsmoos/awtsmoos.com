# B"H
# Implementation Ledger

- [x] Inspected Git state, active claims, prior casting handoff, and real hashes.
- [x] Read the canonical GLB hydration, imported clip policy, combat events, equipment, inventory, movement, collision, and update-loop contracts.
- [x] Preserved imported standing, walking, running, jumping, falling, punch, and stab clips as the base animation authority.
- [x] Added a validated actor-neutral custom-action registry.
- [x] Added separate `player.action.staff.cast` and `player.action.sword.cast` messages.
- [x] Added separate staff and sword definitions, equipment requirements, semantic-bone poses, priorities, recovery, and release events.
- [x] Added dynamic registration for future declarative AI-authored actions.
- [x] Layered custom actions only after imported GLB clip sampling.
- [x] Added two friendly Chossids using the exact canonical GLB source with isolated model, skeleton, equipment, imported-animation, and custom-action state.
- [x] Added a renderer-neutral combat effects adapter.
- [x] Added a real GLB v2 binary manifest loader for Node.
- [x] Added renderer-free scene nodes, isolated simulated skeletons, real octree/capsule/triangle collision, movement, double jump, inventory, equipment, combat, enemies, projectiles, damage, XP, custom actions, and friendly actors.
- [x] Added fixed-step accelerated time and deterministic delayed-task scheduling.
- [x] Added finite snapshots for model, animations, actions, movement, collision, inventory, equipment, combat, enemies, friendly actors, scheduler, events, and clock.
- [x] Added repository documentation and CLI instructions.
- [x] Wrote tests only after production and documentation files existed.
- [x] Fixed each observed test failure individually.
- [x] Re-ran focused, adjacent, import-graph, line-limit, syntax, whitespace, and scoped Git checks.
- [x] Generated source and artifact hash manifests.
