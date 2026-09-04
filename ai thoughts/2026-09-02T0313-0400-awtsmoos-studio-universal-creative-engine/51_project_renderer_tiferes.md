B"H
Boruch Hashem
Blessed is He

# Project + Renderer Debt — Tiferes Final Plan

> Tiferes lets the project facade remain one familiar gate while lifecycle chambers breathe behind its wall;  
> Awtsmoos.com lets crop geometry leave renderer dispatch, so each module becomes smaller without making callers crawl.

## Exact Write Set
- NEW `modules/project/ProjectDocument.js`
- NEW `modules/project/ProjectUndoLifecycle.js`
- WHOLE-FILE REWRITE `modules/project/Project.js`
- NEW `modules/renderers/SourceMediaGeometry.js`
- WHOLE-FILE REWRITE `modules/renderers/sourceRenderers.js`
- NEW `tests/077_project_timestamp_fidelity_smoke.mjs`

## Project Contract
- `ProjectDocument.js`: create/hydrate/serialize canonical documents; `updatedAt: input.updatedAt ?? Date.now()`.
- `ProjectUndoLifecycle.js`: snapshot/commit/undo/redo only.
- `Project.js`: facade re-exporting document, lifecycle, collections, and `touchProject`.
- Current import paths and export names remain unchanged.

## Renderer Contract
- `SourceMediaGeometry.js`: `mediaRect`, node-size fallback, crop clamping.
- `sourceRenderers.js`: visible guard, transforms, renderer dispatch, cropped-media drawing, audio predicate; re-exports `mediaRect`.

## Verification
1. Guard `Project.js` SHA `38419d34565fafe87cd02cde1cf99def33fa822611d8abd92b5aeb7a5097de6f` and renderer SHA `55a088913894306e6d5f167459e1c23a5e1d3cde726a78c980e96109756fed06`.
2. Assert new paths absent and `ProjectHistory.js` unchanged.
3. Whole-file writes only.
4. Reread, syntax, tabs, <=120 lines.
5. Run 077, 024, 071, 073, then focused 054/069-076.
6. Run confidence line-count gate; only after green begin the broader model timestamp-fidelity rewrite.

## NEXT_ACTION
Perform the guarded six-file implementation, then verify the public facade and media geometry behavior before touching sibling model factories.
