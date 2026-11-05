# B"H
# Renderer-Free Gameplay Simulation

## Purpose

The Node.js simulation advances Mitzvah World mechanics without opening a browser, creating a canvas, rendering WebGL, or taking screenshots. It is designed for automated agents, long scenarios, collision investigation, gameplay balancing, deterministic regression checks, and faster-than-realtime inspection.

## Real model loading

`GlbManifestLoader` reads the shipped `assets/models/player/chossid.glb` binary directly. It validates the GLB v2 header, extracts the JSON chunk, and reports real nodes, scene roots, skin joints, mesh count, and imported animation names.

`SimulatedModelFactory` creates isolated scene and skeleton vessels from that real hierarchy. The player and friendly NPCs therefore share one GLB source but never mutable bones.

## Real mechanics reused

The simulator instantiates the actual:

- movement controller
- jump state
- movement/collision bridge
- octree
- capsule mover
- triangle colliders
- inventory store
- equipment runtime
- combat coordinator
- cooldown and cast lifecycle
- custom-action registry and message bridge

Only presentation is replaced. `SimulationCombatEffects` performs projectile travel, impact, damage, and XP as inspectable data rather than meshes and particles.

## Deterministic time

`SimulationClock` uses fixed steps and never sleeps. `runFor(3600)` may process one simulated hour as quickly as the CPU permits. Its receipt contains simulated seconds, steps, wall seconds, and the measured faster-than-realtime ratio.

## Inspection

A snapshot includes:

- GLB source and manifest counts
- imported clip list and selected clip
- player transforms and jump state
- collision triangles, contacts, and normals
- action ID, phase, weight, release count, and bound bones
- inventory and equipment
- combat cast, cooldowns, projectiles, and enemy health
- friendly NPC model and action state
- player XP
- bounded event history

This runtime evidence is the acceptance authority. Screenshots are not involved.

## CLI

From the game root:

```bash
node experiments/Awtsmoos/src/simulation/runGameplaySimulation.mjs \
	--seconds=120 \
	--speed=600 \
	--step=0.0166666667
```

Use `--model=/absolute/path/to/chossid.glb` to inspect another canonical build while retaining the same mechanics.
