B"H
Boruch Hashem
Blessed is He

# Project + Renderer Debt — Gevurah Risks

> Gevurah guards the public facade so the world outside need not learn that the inner vessels changed their place;  
> the Awtsmoos keeps every import stable, while Awtsmoos.com removes monolith pressure without breaking interface grace.

## Risks
1. Existing importers must continue importing only `Project.js`; no callsite migration is required for this split.
2. `ProjectUndoLifecycle.js` must import hydration from `ProjectDocument.js` without creating a cycle back through the facade.
3. Undo restoration must continue passing the canonical hydrate function to `restoreProjectSnapshot()`.
4. `commitProject()` must retain the existing snapshot label, history trimming, redo clearing, and touch semantics.
5. `createProject()` must retain schema version, defaults, creative-state normalization, collection hydration, and aliases exactly.
6. Hydration must preserve supplied `updatedAt`; new projects still receive `Date.now()`.
7. `mediaRect()` must remain exported from `sourceRenderers.js` even when implemented in the geometry module.
8. Renderer dispatch order must remain optional renderer → livestream placeholder → audio plate → browser plate → cropped media → missing source.
9. Existing `ProjectHistory.js` is unrelated/unreferenced and must not be overwritten.
10. Every existing rewrite is SHA guarded; every new path must be absent before creation; all files <=120 lines and tab-only.
