# B"H
# Final Handoff

## What now exists

The canonical Chossid GLB remains authoritative for imported standing, walking, running, jumping, falling, punch, and stab clips. Custom behavior is layered only when the GLB does not provide it.

Staff and sword are separate contracts:

- `player.action.staff.cast` -> `staff.cast` -> `player.action.staff.release`
- `player.action.sword.cast` -> `sword.cast` -> `player.action.sword.release`

Each definition owns independent timing, keyframes, equipment requirements, priority, recovery, and semantic-bone motion. Future AI-authored actions register declaratively through the same validated registry without edits to the central player controller.

The player animation loop samples the real imported GLB clip first and applies a custom action afterward. Existing locomotion clips were not deleted, renamed, or replaced.

Two friendly Chossids now load `./assets/models/player/chossid.glb`. They share the canonical source identity but each receives an isolated scene, skeleton, imported-animation player, inventory, equipment runtime, bus, and custom-action runtime.

The Node simulation reads the actual GLB v2 binary JSON chunk and builds renderer-free scene and skeleton vessels. It reuses real movement, jump, octree, capsule mover, triangle collider, inventory, equipment, combat, cooldown, action, projectile, damage, and XP authorities. It replaces only DOM, WebGL presentation, and wall-clock waiting.

`SimulationClock` and `SimulationScheduler` allow long deterministic scenarios to advance without sleeping. The final 120-second scenario ran 29.703 times faster than realtime and left no pending scheduled work.

## Public runtime surfaces

- `runtime.playerActionRegistry`
- `runtime.playerActions`
- `runtime.registerPlayerAction(definition)`
- `runtime.dispatchPlayerAction(message)`
- `runtime.friendlyNpcs.dispatch(actorId, message)`
- `runtime.friendlyNpcs.register(definition)`
- `GameplaySimulation.create(options)`
- `simulation.runFor(seconds)`
- `simulation.runScaled(wallBudgetSeconds)`
- `simulation.runUntil(predicate, maximumSeconds)`
- `simulation.snapshot()`

## Documentation

- `docs/CUSTOM_PLAYER_ACTIONS.md`
- `docs/HEADLESS_GAMEPLAY_SIMULATION.md`
- `experiments/Awtsmoos/src/playerActions/README.md`
- `experiments/Awtsmoos/src/simulation/README.md`

## Evidence artifacts

Directory: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-custom-player-actions-headless-simulation-gpt56`

- `simulation-120s.json`
- `simulation-120s-summary.json`
- `simulation-120s.stderr.log`
- `touched-files.txt`
- `source-sha256.txt`
- `scoped-git-status.txt`

No screenshot was used as acceptance evidence. No commit was created.
