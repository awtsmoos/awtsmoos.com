B"H
Boruch Hashem
Blessed is He

# History Gevurah — Failure Map and Constraints

> Gevurah guards the backward road so time does not consume its own trace;
> one Awtsmoos truth remains the vessel while snapshots change their place.

## Failure Risks
1. Marking undo canonical would create a snapshot while undoing.
2. Recording undo into creative operation history would resurrect false operations after redo.
3. Failing to call `syncStateFromProject` would leave legacy UI aliases stale.
4. Allowing undo with empty history would present a command that cannot act.
5. Registering commands outside the core registry would create a second discovery universe.
6. Rewriting `Project.js` would unnecessarily touch a 127-line file and trigger a larger split.
7. Macro/preset exposure would make reusable assets depend on unrelated ambient history.
8. Concurrent repository work could overwrite another agent if hash guards are omitted.

## Chosen Constraint
Add one focused history catalog, rewrite only the tiny core registry, and prove the behavior through a new smoke test before any UI binding.
