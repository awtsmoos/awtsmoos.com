B"H
Boruch Hashem
Blessed is He

# Source List Commands — Chesed Brainstorm

> The Awtsmoos lets one visible row become a doorway into the same command river that AI can know;  
> Awtsmoos.com keeps selection and layer order from hiding in DOM handlers where private mutations grow.

## Ideal Possibilities
- Expose `stage.source.select` as editor context available to human/API/JSON/AI/macro without creating undo history.
- Expose `stage.source.reorder` as a canonical transactional command so drag-and-drop becomes undoable and auditable.
- Rewrite `stageSourceRows.js` completely: accessible row rendering, clear event handlers, no direct `selectedId` mutation, no direct `reorderSource` import.
- Create one lightweight source-list projection that registers with `StageProjectionRegistry` exactly once per runtime state.
- Let both lazy Sources and Stage Workstation request that projection without duplicate listeners.
- Inject the public creative API through feature context instead of relying on a hidden global.
- Preserve source detail badges, crop information, transform summary, visualizer family label, drag ordering, Stage redraw, and projection refresh.
- Add focused command parity/history test plus DOM-free projection/controller test where possible.
