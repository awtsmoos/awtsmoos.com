# B"H
# Test Evidence

## Focused tests

- `LIVE_MOBILE_VISUAL_RESCUE_TEST_OK=1`
- `VISUAL_STABILITY_CONTRACTS_TEST_OK=1`
- `PLAYER_ACTION_BIND_POSE_TEST_OK=1`

These prove feature timing, expanded rail policy, physical UV ranges, mixed road sources, Spark Blade draw, house sidedness/culling, mapped demon materials, equipment synchronization, and non-accumulating custom action quaternions.

## Adjacent regressions

- `PLAYER_ACTION_SYSTEM_TEST_OK=1`
- `PLAYER_CASTING_ANIMATION_TEST_OK=1`
- Inventory/equipment: 4 passed, 0 failed
- Combat contracts: 9 passed, 0 failed
- `GAMEPLAY_SIMULATION_TEST_OK=1`
- `VISUAL_RESCUE_REGRESSION_SET_OK=1`

## Served HTTP

The game and all new integration modules returned HTTP 200 from `http://127.0.0.1:8080/games/mitzvahWorld/`.

## Live 390×844 runtime evidence

Artifact: `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-live-mobile-visual-rescue-gpt56/live-mobile-runtime.json`

Measured values:

- Viewport: 390×844, DPR 2
- Core runtime publication: 59.531 seconds in isolated headless SwiftShader
- Deferred feature settlement after core: 7.490 seconds
- Feature phase: `ready`
- Requests: 78
- Page errors: 0
- Protocol exceptions: 0
- Protocol log errors: 0
- Right rail: visible, expanded, ten buttons
- Quest actor: canonical Chossid GLB, 20 bones, 14 clips, zero primitive actor meshes
- Terrain UV range: 0–31
- Road UV range: 0–16
- Road source layers: 3
- Ground texture layers: 5
- Grass sources: 8
- Ready source textures: 13
- Demon meshes: 6
- Mapped demon materials: 6
- Stable house meshes: 177
- Stable house materials: 177
- Staff cast: drawn in right hand, three visible parts, `staff.cast` active
- Sword cast: drawn in right hand, five visible parts, `sword.cast` active
- Coat meshes during casts: 2 and visible

No screenshot was used as acceptance evidence.
