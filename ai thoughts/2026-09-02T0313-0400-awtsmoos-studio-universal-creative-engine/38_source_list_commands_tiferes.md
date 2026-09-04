B"H
Boruch Hashem
Blessed is He

# Source List Commands — Tiferes Final Plan

> Tiferes joins a lightweight projection to a universal command tongue, so list and document agree;  
> Awtsmoos.com lets Sources wake the rows without dragging the whole inspector tree into first-paint decree.

## Exact Intended Write Set
- NEW `modules/creative/catalog/sourceCommands.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/StageCommandIds.js`
- WHOLE-FILE REWRITE `modules/creative/catalog/registerCoreCommands.js`
- WHOLE-FILE REWRITE `modules/stage/stageSourceRows.js`
- NEW `modules/stage/SourceListProjection.js`
- WHOLE-FILE REWRITE `modules/features/sources/loadSourcesFeature.js`
- WHOLE-FILE REWRITE `modules/features/stage/loadStageWorkstationFeature.js`
- NEW `tests/075_creative_source_order_smoke.mjs`
- NEW `tests/076_source_list_projection_smoke.mjs` if a DOM-free fixture can prove row dispatch without browser-global leakage.

## Command Contract
- `stage.source.select`: parameters `{sourceId}`, mutation `editor`, validates target exists, sets `state.selectedId`, returns detached source identity.
- `stage.source.reorder`: parameters `{sourceId,targetId}`, mutation `canonical`, calls existing reorder semantics, no-op on impossible/same ordering, therefore undo/redo compatible.

## Projection Contract
- `ensureSourceListProjection(context)` registers one row renderer per `state` and immediately renders.
- Sources invokes it after Visualizer loads and before controls are bound.
- Stage Workstation invokes the same helper, but keeps inspector registration separate.
- Row click/drop dispatch commands through injected `context.api`, then redraw/refresh projection after successful completion.

## Verification
1. Fresh SHA/new-path guards.
2. Whole-file write only.
3. Full reread of every touched file.
4. Syntax, tabs-only, <=120 lines.
5. Run 075/076, then 054, then 069–074.
6. Run confidence/broad creative suite.
7. Only then split remaining legacy >120 files and do isolated browser proof.

## NEXT_ACTION
Inspect current Stage Workstation and fake-element capabilities, capture exact hashes/new-path collisions, and execute the guarded write set only if unchanged.
