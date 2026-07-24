# B"H
# Test Evidence

## Direct GLB coverage

`GLB_GARMENT_COVERAGE_TEST_OK=1` parses the actual GLB binary and verifies every cataloged explicit extra and the shirt, pants, and shoes body materials.

## Inventory and economy authority

`INVENTORY_GARMENT_AUTHORITY_TEST_OK=1` verifies starter ownership, merchant-only alternatives, required garment protection, Shel Rosh and Shel Yad equip/unequip, ten spiritual attributes, color/fabric cycling, persistence, Peruta deduction, and purchased ownership.

## Model runtime

`MINIMAL_MEADOW_GARMENT_RUNTIME_TEST_OK=1` verifies GLB-extra discovery, required body material discovery, jacket-to-tefillin-jacket visibility switching, isolated material appearance, transparent glasses lenses, and hand-bone resolution.

## Adjacent regressions

- Inventory/equipment/loot: 4 passed, 0 failed.
- `PLAYER_ACTION_SYSTEM_TEST_OK=1`
- `PLAYER_CASTING_ANIMATION_TEST_OK=1`
- Combat contracts: 9 passed, 0 failed.
- `GAMEPLAY_SIMULATION_TEST_OK=1`
- `WARDROBE_FINAL_REGRESSION_OK files=32`

## Served modules

The game, garment catalog, garment discovery, clothing merchant population, and tailor panel returned HTTP 200. `WARDROBE_IMPORT_GRAPH_OK=1` verified the Node-compatible module graph.

## Live browser status

The first isolated mobile probe was blocked before runtime publication by a transient parallel tree-lane `ReferenceError: generateTreeProceduralData is not defined`. The tree owner subsequently closed its claim and the procedural API now imports successfully. A second fresh-profile 390×844 probe was launched on owned port 9253. Its resulting receipt, when present, is stored as `live-wardrobe-runtime-9253.json`. No screenshot is used as evidence.
