B"H
Boruch Hashem
Blessed is He

# Scene First-Pass Delta — Planned vs Actual

> The Awtsmoos reveals the vessel by reading every line in its light;  
> Awtsmoos.com splits what grew too broad, so each responsibility becomes clear and right.

## PLANNED
- Add canonical scene selection, duplication, rename, and deletion.
- Add shared command metadata for human/API/JSON/AI/macro access.
- Rewrite legacy scene controls so they dispatch public commands only.
- Keep every touched source/test file at or below 120 lines.
- Re-read every touched file before testing.

## ACTUAL FIRST PASS
- Scene operations landed in `SceneOperations.js` at 87 lines.
- Scene command surfaces landed at 26 lines.
- Scene selection commands landed at 87 lines.
- Scene structural commands landed at 82 lines.
- Scene catalog landed at 19 lines.
- Core registry remained small at 31 lines.
- Accessible scene-list view landed at 48 lines.
- Lifecycle test landed at 89 lines.
- UI command-binding test landed at 96 lines.
- `scenes.js` landed at 135 lines and therefore violates the source-size constitution.
- The suspected `clonePlain` import was verified against `ids.js`; it is a real export, so no repair is needed there.

## DELTA
1. Split `SceneCommandController` out of `scenes.js` rather than shortening comments or compressing logic.
2. Keep `scenes.js` as a tiny facade exporting `bindScenes`, `refreshScenes`, and re-exporting the controller for compatibility/tests.
3. Preserve the exact command IDs and behavior from the first pass.
4. Verify the creative-evidence event has at least one producer; if absent, add refresh through the existing canonical runtime signal rather than inventing a parallel event universe.
5. Only after the split passes the structural gate may runtime tests begin.

## EXACT SECOND-PASS WRITE SET
- NEW `modules/ui/scene/SceneCommandController.js`
- WHOLE-FILE REWRITE `modules/scenes.js`
- No other source file is authorized for mutation unless verification demonstrates a defect.

## NEXT_ACTION
Confirm the controller path is absent and current `scenes.js` hash remains `87e7d2c7d087638a5bac030421ae45837abefc2a95b288224439c35ceb31ff9d`, then write both complete files and run syntax/tab/line gates followed by tests 069–074.
