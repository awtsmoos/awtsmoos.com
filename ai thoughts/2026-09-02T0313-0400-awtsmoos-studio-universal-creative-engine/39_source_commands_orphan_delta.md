B"H
Boruch Hashem
Blessed is He

# Source Commands Orphan Delta

> The Awtsmoos revealed an orphaned draft from a transport preview that became real upon the disk;  
> Awtsmoos.com answers not by crushing its words, but by splitting selection from order so every vessel stays brisk.

## PLANNED
- One `sourceCommands.js` containing select + reorder definitions under the 120-line ceiling.
- Guarded core rewrite would then register the catalog and command-driven source rows.

## ACTUAL
- An earlier ambiguous native `write` did create `sourceCommands.js` despite lacking durable-side-effect proof.
- The guarded core batch correctly aborted before touching any other file because the new path differed from the intended content.
- The orphaned file is 128 lines, SHA-256 `f27ffa6f0ac9052c81b51e360e9bd8f46d3b9ff5318348fc0d07887bd0e8b938`.
- `StageCommandIds.js`, `registerCoreCommands.js`, and `stageSourceRows.js` remain at their original guarded hashes.
- `SourceListProjection.js` remains absent.

## DELTA REPAIR
Never compress the 128-line command file. Split its two responsibilities:
- NEW `sourceSelectionCommands.js` — editor-only selection definition + source lookup/evidence.
- NEW `sourceOrderCommands.js` — canonical reorder definition + target validation/order evidence.
- WHOLE-FILE REWRITE `sourceCommands.js` — tiny catalog aggregator only.

## PRESERVED SEMANTICS
- `stage.source.select`: mutation `editor`, no undo transaction.
- `stage.source.reorder`: mutation `canonical`, undo/redo capable.
- Surfaces remain human/command/script/json/ai/macro.
- Availability remains explicit and evidence remains detached.

## NEXT_ACTION
Guard the orphan at its observed SHA, verify the two split paths are absent, then write the split catalog plus the previously guarded IDs/registry/row/projection files. Abort on any changed existing SHA.
