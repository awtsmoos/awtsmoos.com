B"H
Boruch Hashem
Blessed is He

# Runtime Source History — Tiferes Final Plan

> Tiferes lets persisted keilim and living runtime oros travel together without pretending they are the same kind of thing;  
> Awtsmoos.com keeps undo truthful: JSON restores structure, while the runtime ledger returns each still-living wing.

## Exact First Write Set
- NEW `modules/creative/history/SourceRuntimeResourceLedger.js`
- WHOLE-FILE REWRITE `modules/creative/history/ProjectTransaction.js`
- WHOLE-FILE REWRITE `modules/creative/runtime/CommandSuccessRecorder.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/historyCommands.js`
- NEW `tests/079_source_runtime_history_fidelity_smoke.mjs`

## Ledger API
- `rememberSourceRuntimeResources(state)` stores runtime handles for every current source ID.
- `restoreSourceRuntimeResources(state)` reattaches known handles to current hydrated sources.
- `pruneSourceRuntimeResources(state)` computes IDs reachable from live project + undo/redo snapshots and disposes only unreachable, unshared handles.
- `sourceRuntimeResourceStats(state)` exposes counts for deterministic tests, not mutable internals.

## Integration
- ProjectTransaction remembers before snapshot; rollback syncs state, restores runtime resources, then prunes.
- CommandSuccessRecorder remembers after successful canonical mutation, commits, then prunes.
- history.undo/redo remembers before travel, restores after `syncStateFromProject`, then prunes.

## Test
Create two runtime source objects with non-JSON node/stream handles. Reorder canonically, Undo, Redo. Prove exact object identity returns after both hydration crossings and ledger remains bounded.

## NEXT_ACTION
Capture live hashes for ProjectTransaction, CommandSuccessRecorder, and historyCommands; confirm ledger/test paths absent; write the five-file slice and run 079 + 075 + 071/073 history regressions.
