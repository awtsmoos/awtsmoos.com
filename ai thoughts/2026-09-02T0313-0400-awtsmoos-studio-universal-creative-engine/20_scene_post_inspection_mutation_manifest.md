B"H
Boruch Hashem
Blessed is He

# Scene Post-Inspection Mutation Manifest

> The Awtsmoos joins every scene-door to one command flame;
> Awtsmoos.com lets touch, script, JSON, macro, and AI speak the same scene name.

## Refined Evidence
- The current lazy Stage workstation already calls `bindScenes(context.state)`.
- Therefore boot and Stage-workstation source do not need mutation.
- The safe global `AwtsmoosStudio` API is already exposed by the creative runtime in normal browser boot.
- The legacy `scenes.js` directly mutates scene arrays/current IDs and is the remaining manual-only scene universe.
- `Project.js` is 127 lines and does not need mutation; focused project operations can live beside it.

## Exact Authorized Write Set
- NEW `modules/project/SceneOperations.js`
- NEW `modules/creative/catalog/sceneCommandSurfaces.js`
- NEW `modules/creative/catalog/sceneSelectionCommands.js`
- NEW `modules/creative/catalog/sceneStructureCommands.js`
- NEW `modules/creative/catalog/sceneCommands.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/registerCoreCommands.js`
- NEW `modules/ui/scene/SceneListView.js`
- WHOLE-FILE REWRITE `modules/scenes.js`
- NEW `tests/073_creative_scene_lifecycle_smoke.mjs`
- NEW `tests/074_scene_ui_command_binding_smoke.mjs`

## Operations
- `project.scene.select`: editor/navigation mutation, no undo snapshot, clears selected source, synchronizes aliases.
- `project.scene.duplicate`: canonical/transactional, fresh scene + fresh source IDs, +24 legacy visual offset, editable settings preserved.
- `project.scene.rename`: canonical/transactional, identity preserved.
- `project.scene.delete`: canonical/transactional, refuses final-scene deletion, deterministic surviving selection.

## UI Adapter
`bindScenes(state, api = globalThis.AwtsmoosStudio)` preserves the current Stage-workstation call signature while allowing tests or future callers to inject the API explicitly. The adapter never mutates scene arrays or IDs directly. It subscribes to the existing creative-evidence event so AI/API mutations refresh the visible scene list too.

## Verification
- syntax, tabs-only, <=120 lines;
- tests 069–074;
- broader creative regression universe;
- command discoverability and source-ID uniqueness;
- duplicate/rename/delete undo/redo + serialization;
- UI button/list dispatch uses public command IDs only;
- isolated browser boot and mobile proof after source tests pass.

## NEXT_ACTION
Recheck existing-file hashes and all new-path collisions; if unchanged, perform one guarded whole-file write batch.
