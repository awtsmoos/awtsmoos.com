# B"H
# Test Evidence

## Focused action system

`node experiments/Awtsmoos/src/test/playerActions/playerActionSystem.test.mjs`

Result: `PLAYER_ACTION_SYSTEM_TEST_OK=1`

Verified separate staff and sword registration, distinct messages, equipment gating, semantic bone mutation, exactly-once release, recovery to idle, imported clip lookup, and registration of a third `gesture.blessing` action without controller edits.

## Headless gameplay simulation

`node experiments/Awtsmoos/src/test/simulation/gameplaySimulation.test.mjs`

Result: `GAMEPLAY_SIMULATION_TEST_OK=1`

Verified real GLB parsing, no DOM, two isolated friendly models sharing one GLB source, movement, run mode, double jump, landing, real capsule-triangle contact, equipment changes, sword-specific cast release, projectile damage, deterministic equipment recovery, empty scheduler, and faster-than-realtime execution.

## Existing regressions

- `PLAYER_CASTING_ANIMATION_TEST_OK=1`
- `PLAYER_ANIMATION_ORDER_TEST_OK=2`
- `INVENTORY_EQUIPMENT_LOOT_TEST_OK=4`
- `COMBAT_CONTRACTS_TEST_OK=9`
- `OCTREE_RAYCAST_TRAVERSAL_TEST_OK=1`

## Integration import graph

The rewritten animation, combat, feature bundle, friendly NPC, action-system, and simulation modules imported together successfully: `INTEGRATION_IMPORT_GRAPH_OK=1`.

## Long accelerated scenario

Artifact: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-custom-player-actions-headless-simulation-gpt56/simulation-120s.json`

Measured:

- 120.000 simulated seconds
- 7,200 fixed steps
- 4.040 wall seconds
- 29.703 times realtime
- 128 GLB nodes
- 65 GLB bones
- 51 meshes
- 1 skin
- 14 imported clips
- 2 isolated friendly actors
- 12 real collision triangles
- Demon health changed from 90 to 62
- Sword custom action completed
- Equipment casting recovered to `false`
- Scheduler pending count reached `0`

## Hygiene

`HYGIENE_OK=1 executableFiles=45 totalFiles=49`

All owned executable files passed syntax and the 120-line ceiling. Executable indentation uses tabs, no trailing whitespace was found, scoped `git diff --check` passed, and SHA-256 hashes were generated.

The CLI stderr contains only Node's existing `MODULE_TYPELESS_PACKAGE_JSON` warning because the repository root does not declare `type: module`; it contains no gameplay exception.
