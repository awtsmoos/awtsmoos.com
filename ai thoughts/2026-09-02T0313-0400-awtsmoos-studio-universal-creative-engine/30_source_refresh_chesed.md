B"H
Boruch Hashem
Blessed is He

# Source Refresh Repair — Chesed

> The Awtsmoos lets a new source enter both the hidden graph and the visible list in one breath;  
> Awtsmoos.com keeps state and projection together, so creation never wears the mask of death.

## Possibilities
- Refresh source projections after every successful add.
- Pass the already-existing `refreshSources` dependency through the lazy Sources initializer.
- Keep `changed()` responsible for status/redraw semantics rather than overloading it with source-list projection.
- Preserve lazy Sources loading and visualizer loading exactly as they are.
- Rewrite the currently compressed `sourceBindings.js` into readable tab-indented helpers while retaining all source factories and permission guards.
