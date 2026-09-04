B"H
Boruch Hashem
Blessed is He

# Source Lifecycle — Gevurah Risks

> Gevurah guards the layer ladder from false motion, duplicate histories, and media killed before Undo may restore;  
> the Awtsmoos keeps every mutation bounded, while Awtsmoos.com lets cleanup happen only beyond memory's door.

## Risks
1. `sourceIds` is currently stale after legacy reorder/move/remove/duplicate; every new structural primitive must sync it atomically.
2. Legacy reorder uses the target's pre-removal index, so earlier→later drags do not truly mean “before target.”
3. A no-op canonical command must be rejected by availability before transaction history is committed.
4. Duplicate streaming sources remains unavailable because a second stable source cannot safely own the same live capture semantics yet.
5. Duplicate non-stream sources may share `node`; disposal must honor shared handle identity.
6. Remove cannot call legacy `removeSource()` because it eagerly stops tracks/revokes object URLs/removes browser nodes.
7. Removed-source fallback selection must be deterministic and serialized consistently with canonical project selection.
8. Layer UI must not call `changed()` in addition to API execution or it can create duplicate legacy commits.
9. Stage loader is the sole layer-binding caller, so API injection is safe but requires exact-hash rewrite.
10. Existing source-order test must keep passing, while new tests must assert `sourceIds` after every operation.
11. Commands should preserve existing public command surfaces and detached evidence payloads.
12. Legacy `layers.js`/`sceneGraph.js` remain compatibility debt until callers are proven migrated; do not delete them in this write.
