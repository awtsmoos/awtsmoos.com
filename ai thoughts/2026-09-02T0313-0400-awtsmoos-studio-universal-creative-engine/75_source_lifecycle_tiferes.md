B"H
Boruch Hashem
Blessed is He

# Source Lifecycle — Tiferes Final Plan

> Tiferes joins identity, order, and lifecycle into small vessels where every command can be seen and tested in light;  
> Awtsmoos.com lets the Stage buttons speak the same tongue as AI while Undo keeps runtime resources alive and right.

## Exact Write Set
NEW:
- `modules/creative/operations/SourceCollectionState.js`
- `modules/creative/operations/SourceCollectionOrdering.js`
- `modules/creative/operations/SourceCollectionLifecycle.js`
- `modules/creative/catalog/sourceLayerCommands.js`
- `modules/creative/catalog/sourceLifecycleCommands.js`
- `tests/080_creative_source_lifecycle_smoke.mjs`
- `tests/081_source_layer_ui_command_smoke.mjs`

WHOLE-FILE REWRITE:
- `modules/creative/catalog/StageCommandIds.js`
- `modules/creative/catalog/sourceOrderCommands.js`
- `modules/creative/catalog/sourceCommands.js`
- `modules/app/layerBindings.js`
- `modules/features/stage/loadStageWorkstationFeature.js`

## Command IDs
- `stage.source.reorder`
- `stage.source.layer.top`
- `stage.source.layer.up`
- `stage.source.layer.down`
- `stage.source.layer.bottom`
- `stage.source.duplicate`
- `stage.source.remove`

## Collection Contract
`SourceCollectionState` owns current-scene lookup, source lookup, order IDs, and sourceIds synchronization.
`SourceCollectionOrdering` owns before-target reorder, layer-edge/step movement, and no-op predicates.
`SourceCollectionLifecycle` owns non-stream duplicate and history-safe detach with deterministic selection fallback.

## Verification
- Hash guards on all five existing rewrites immediately before writing.
- New-path collision guards.
- Syntax/tabs/<=120 on every touched file.
- Test 080: order/sourceIds parity, no-op history cleanliness, duplicate Undo/Redo, remove Undo/Redo, exact runtime resource restoration, permanent cleanup after history eviction.
- Test 081: all six layer/lifecycle buttons dispatch public commands only; no legacy `changed()` callback mutation.
- Re-run 075, 076, 079, 054, 071, 073.
- Then whole Studio suite.

## NEXT_ACTION
Read/hash `layerBindings.js` and `sourceCommands.js`, confirm test/new operation paths absent, then perform one guarded vertical write and test it before touching Stage canvas drag.
