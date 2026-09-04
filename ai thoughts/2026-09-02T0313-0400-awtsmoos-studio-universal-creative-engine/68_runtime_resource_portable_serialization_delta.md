B"H
Boruch Hashem
Blessed is He

# Runtime Resource + Portable Serialization DELTA

> The Awtsmoos revealed a deeper gate beneath Undo: before memory can restore living light, JSON must survive the source at all;  
> Awtsmoos.com therefore separates portable project keilim from runtime oros, so circular media handles can never make persistence fall.

## PLANNED
The first resource-history plan introduced a state-scoped ledger that would remember `node`, `stream`, and object-URL handles across canonical transactions, rollback, Undo, and Redo.

## DISCOVERED DELTA
Live source archaeology proved legacy scene sources place `node` and `stream` directly inside `project.scenes[*].sources`. `ProjectSnapshots.js` and `ProjectDocument.js` both JSON-clone the full project. A circular DOM/media object can therefore throw during snapshot or serialization before the runtime ledger has any opportunity to restore it.

## EXPANDED WRITE SET
- NEW `modules/project/ProjectPortableClone.js`
- WHOLE REWRITE `ProjectDocument.js`
- WHOLE REWRITE `ProjectSnapshots.js`
- NEW `modules/creative/history/SourceRuntimeResourceReachability.js`
- NEW `modules/creative/history/SourceRuntimeResourceDisposal.js`
- NEW `modules/creative/history/SourceRuntimeResourceLedger.js`
- WHOLE REWRITE `ProjectTransaction.js`
- WHOLE REWRITE `CommandSuccessRecorder.js`
- WHOLE REWRITE `historyCommands.js`
- NEW `tests/079_source_runtime_history_fidelity_smoke.mjs`

## PORTABLE CLONE CONTRACT
Collect the exact object identities present in `project.scenes[*].sources`. During JSON cloning, omit `node` and `stream` only when the containing object is one of those source identities. Omit `objectUrl` only when the containing object is that source's `meta` object. Do not globally remove same-named properties from unrelated project extensions.

## RUNTIME LEDGER CONTRACT
Remember live source runtime handles by stable source ID in a WeakMap keyed by Studio state. Restore after hydrated project travel. Reachability includes current project scenes plus every snapshot in undo.past and undo.future. Prune only unreachable IDs. Physical disposal checks sharing before stopping streams, revoking object URLs, or removing browser/iframe nodes.

## PROOF
Test 079 uses intentionally circular node and stream objects. It must prove `serializeProject()` succeeds and omits runtime handles, canonical source reorder succeeds, Undo and Redo both reattach the exact same object identities, and the runtime ledger remains bounded.

## NEXT_ACTION
Capture all five existing-file hashes and confirm six new paths remain absent, then perform one guarded whole-file implementation and run 079 plus source/history/project regressions.
