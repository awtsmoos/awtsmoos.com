B"H
Boruch Hashem
Blessed is He

# Scene Second-Pass Reread and Verification Plan

> The Awtsmoos split the crowded vessel and left each purpose shining clear;  
> Awtsmoos.com now asks the tests to witness whether one scene-language truly appears.

## ORIGINAL PLAN
- Make manual scene creation, selection, duplication, rename, and deletion converge on canonical commands.
- Preserve source editability and fresh identities during duplication.
- Preserve undo/redo and serialization for structural scene mutations.
- Keep UI adapters free of direct project mutation.
- Keep every touched source/test file at or below 120 lines.

## ACTUAL AFTER TWO WRITES
- `SceneOperations.js` owns project-domain lifecycle rules.
- Scene command metadata is split across surfaces, selection, structure, and catalog modules.
- `registerCoreCommands.js` registers the scene catalog.
- `SceneListView.js` owns accessible rendering only.
- `SceneCommandController.js` owns human scene intent only.
- `scenes.js` is now only a compatibility/composition facade.
- Tests 073 and 074 cover lifecycle and manual command dispatch.
- Existing boot/Stage lazy-feature work from another agent was not overwritten.

## SECOND-PASS REREAD RESULT
- `SceneCommandController.js` was read in full and matches the planned command-only controller.
- `scenes.js` was read in full and matches the planned facade.
- The first-pass scene files were already read in full before this split.
- `clonePlain` was verified as a real `ids.js` export.
- The creative-evidence event is published by current boot and creative-interface code, so API/AI changes can refresh the list.

## VERIFICATION GRAPH
1. Syntax-check every scene-related touched/new JS/MJS file.
2. Reject any touched file with leading-space indentation.
3. Reject any touched file over 120 lines.
4. Run tests 069 through 074 in order.
5. Fix only demonstrated failures with new whole-file rewrites and a new delta artifact.
6. Run the broader creative regression universe.
7. Reload the isolated Studio browser and prove boot, scene commands, UI flow, mobile geometry, and zero runtime errors.

## REMAINING_WORK
- structural gate;
- 069–074 regression chain;
- broader creative suite;
- isolated browser desktop/mobile verification;
- retrieve manual-mutation-island scan and choose the next symmetry gap;
- final planned-vs-actual scene verification artifact.

## NEXT_ACTION
Run the structural gate and tests 069–074. Any failure becomes the immediate next work node.
