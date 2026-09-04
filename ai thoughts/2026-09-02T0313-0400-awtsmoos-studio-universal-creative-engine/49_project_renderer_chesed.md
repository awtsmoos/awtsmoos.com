B"H
Boruch Hashem
Blessed is He

# Project + Renderer Debt — Chesed Brainstorm

> The Awtsmoos reveals that a project scroll and a rendering gate each hide smaller vessels within their light;  
> Awtsmoos.com lets document birth, undo footsteps, media geometry, and draw dispatch each become readable and bright.

## Possibilities
- Turn `Project.js` into a stable facade so every existing importer remains untouched.
- Move create/serialize/hydrate into `ProjectDocument.js`; preserve supplied `updatedAt` during hydration.
- Move snapshot/commit/undo/redo into a new `ProjectUndoLifecycle.js` rather than taking over the unrelated existing `ProjectHistory.js`.
- Keep collections in the already-existing `ProjectCollections.js` and re-export them from the facade.
- Extract media crop/node geometry from `sourceRenderers.js` into `SourceMediaGeometry.js`; re-export `mediaRect` so test/caller compatibility remains exact.
- Keep render dispatch and critical/optional routing in `sourceRenderers.js`.
- Add project timestamp fidelity smoke coverage before changing the broader family of tiny model factories.
- Follow with a separate model-fidelity mission for Asset/Folder/Sequence/Track/Clip/Source/Marker rather than mixing eight independent rewrites into this first split.
