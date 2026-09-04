B"H
Boruch Hashem
Blessed is He

# Scene Gevurah — Constraints, Failure Graph, and Boundaries

> Gevurah guards the copy so no borrowed ID survives the new flame;
> the Awtsmoos keeps one project truth while every vessel still can name the same.

## Observed Risks
1. Legacy `scenes.js` directly pushes into `state.scenes`, bypassing transactions and operation history.
2. Legacy switching mutates `state.currentSceneId` and `selectedId` without canonical project selection semantics.
3. Legacy duplication clones graph source nodes with new IDs, but this behavior is not available to AI/API.
4. Reusing a source ID across duplicated scenes would make selection, hierarchy, and future asset bindings ambiguous.
5. Deleting the last scene could leave Stage and project invariants without a renderable context.
6. Deleting the current scene without deterministic fallback could leave aliases pointing to dead IDs.
7. A command-driven API mutation could leave the visible scene list stale unless the shared creative refresh includes scenes.
8. `projectCommands.js` is already ~99 lines, so adding lifecycle commands there would crowd it beyond the small-module law.
9. `Project.js` is over the 120-line ceiling and must remain untouched unless intentionally split.
10. `Scene.js` and old `scenes.js` contain compressed legacy formatting; touching `scenes.js` requires a complete readable rewrite, while `Scene.js` can remain untouched if cloning is isolated in a new module.
11. Boot is close to the size ceiling; any refresh wiring must be measured before mutation and split if necessary.
12. Concurrent Studio agents require SHA-256 guards before every existing-file rewrite.

## Safety Rules
- Use new focused `sceneCommands.js` rather than expanding `projectCommands.js`.
- Use a new cloning helper to avoid disturbing `Scene.js` merely for duplication.
- Keep project-domain lifecycle helpers independent of DOM.
- Keep UI code as a command dispatcher and list renderer only.
- Require exact scene IDs and useful validation errors.
- Make delete unavailable when only one scene remains.
- Re-read and hash every existing write candidate immediately before source mutation.
