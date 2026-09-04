B"H
Boruch Hashem
Blessed is He

# Scene Tiferes — Exact Implementation and Verification Plan

> Tiferes joins the button and command, the snapshot and screen, in one light;
> Awtsmoos.com lets the scene be simple above while remaining inspectable all the way down right.

## Candidate Write Set
- NEW `modules/project/SceneCloning.js`
- WHOLE-FILE REWRITE `modules/project/ProjectCollections.js`
- NEW `modules/creative/catalog/sceneCommands.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/registerCoreCommands.js`
- WHOLE-FILE REWRITE `modules/scenes.js`
- CONDITIONAL WHOLE-FILE REWRITE `modules/app/bootNesherStudio.js` only if line count stays <=120 and shared scene-list refresh requires it; otherwise split refresh coordination into a new helper.
- NEW `tests/073_creative_scene_lifecycle_smoke.mjs`
- NEW `tests/074_scene_ui_command_binding_smoke.mjs` if DOM seams can be cleanly injected/tested without fake architecture.

## Command Identities
- `project.scene.select`
- `project.scene.duplicate`
- `project.scene.rename`
- `project.scene.delete`

Creation remains `project.scene.create`.

## Lifecycle Contracts
- SELECT: canonical current/selection scene IDs change; no object identity is replaced.
- DUPLICATE: new scene ID + new source IDs; source configuration retained; duplicate selected; one transaction.
- RENAME: scene identity retained; trimmed non-empty name; one transaction.
- DELETE: unavailable for last scene; selected/current fallback deterministic; removed scene absent from serialization; one transaction.

## UI Contract
- Add button → `project.scene.create`.
- Duplicate button → `project.scene.duplicate` for current scene.
- Scene list click → `project.scene.select`.
- UI never pushes/splices scene arrays directly.
- Shared canonical refresh also refreshes the scene list so API/AI mutations are immediately visible.

## Verification
1. `node --check` every touched/new JS file.
2. Tabs-only scan and line-count gate <=120.
3. Scene lifecycle model/API/AI/JSON parity.
4. Duplicate ID uniqueness and data preservation.
5. Delete-last negative behavior.
6. Undo/redo round trip for duplicate/rename/delete.
7. Serialized canonical truth after every lifecycle operation.
8. Existing tests 069–072 plus new scene tests.
9. Broader creative regression universe.
10. Real browser desktop and 390x844 mobile proof after native boot diagnostic is closed.
11. Full reread of touched files and PLANNED-vs-ACTUAL delta artifact.

## NEXT_ACTION
Finish headless native-boot exception capture, then hash/line-count all scene write candidates and execute the smallest full-file implementation consistent with the evidence.
