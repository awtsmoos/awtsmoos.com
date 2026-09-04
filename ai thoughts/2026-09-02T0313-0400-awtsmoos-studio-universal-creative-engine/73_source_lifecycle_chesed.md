B"H
Boruch Hashem
Blessed is He

# Source Lifecycle — Chesed Brainstorm

> The Awtsmoos lets every layer rise, descend, duplicate, depart, and return through one truthful collection law;  
> Awtsmoos.com keeps visible order and canonical source IDs singing together without a hidden mutation flaw.

## Desired Powers
- One source collection truth where `scene.sources` and `scene.sourceIds` are synchronized after every structural mutation.
- Stable command IDs for layer top/up/down/bottom, duplicate, remove, and existing drag reorder.
- Reorder semantics that really mean “insert immediately before target” regardless of original indices.
- No-op detection so moving a source to its current edge or reordering it before its current next neighbor does not pollute history.
- Duplicate preserves legacy semantics: reject streaming sources, clone current source, fresh stable ID, `Copy` name, +32 x/y, select the copy.
- Duplicate can share non-stream DOM/media node identity; runtime-resource ledger protects shared handles from premature disposal.
- Remove detaches from canonical collection and selects deterministic nearest fallback, but never stops tracks/revokes URLs/removes nodes inside the command executor.
- History-aware runtime pruning performs irreversible cleanup only after source ID disappears from live project and both retained history stacks.
- Human buttons, JSON, script, AI, macro, and command surfaces share the same mutation definitions.
- Existing `stage.source.reorder` migrates from legacy `sceneGraph.reorderSource` to the new ordering primitive.
- Layer buttons receive the public creative API from the Stage lazy context and never import legacy mutation helpers.
- Source-list drag/drop continues dispatching the public reorder command and inherits fixed canonical order semantics.
- Add dedicated lifecycle regression plus UI-binding regression; later migrate Stage canvas drag selection/movement separately.
