B"H
Boruch Hashem
Blessed is He

# Source Lifecycle — First Test DELTA

> The Awtsmoos showed that history replaced the Scene vessel while the test still held yesterday's shell;  
> Awtsmoos.com keeps the implementation untouched when evidence says the stale fixture—not production—broke the bell.

## PLANNED
Test 080 would prove source order/sourceIds parity through reorder, layer moves, duplicate, remove, Undo/Redo, and runtime cleanup.

## ACTUAL
All twelve touched files passed syntax, tab indentation, and <=120-line gates. The first behavioral assertion failure happened only after Undo/Redo hydration. `state.sources` reflected the current hydrated scene, but the test's top-level `scene` constant still referenced the pre-hydration Scene object. Its `sourceIds` therefore represented stale history while the current source list had advanced.

## DELTA REPAIR
Rewrite test 080 completely under SHA `5bf261a9a2b2f5a2f414b15f06a8ee9a2a8f2a25374be57e7c2333918222f680`. Keep a seed-scene reference only for initial setup, but every parity/order assertion must resolve the current scene from `state.project.scenes` using `state.currentSceneId`. Do not touch production files unless the corrected test exposes a real mismatch.

## VERIFICATION
1. Run 080 alone.
2. If green, run 081, 075, 076, 079, 054, 071, and 073.
3. Then run the full Studio suite.

## NEXT_ACTION
Perform the guarded whole-file test rewrite, then execute 080 immediately.
