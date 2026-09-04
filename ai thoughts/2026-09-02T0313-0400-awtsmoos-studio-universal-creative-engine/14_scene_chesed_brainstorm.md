B"H
Boruch Hashem
Blessed is He

# Scene Chesed — One Scene Language Through Every Door

> The Awtsmoos gives each scene a name, a lineage, a gate, and a place;
> Awtsmoos.com lets touch, AI, JSON, and script reveal the very same creative face.

## Unbounded Possibility
- Scene creation, selection, duplication, rename, and deletion become stable command identities.
- Manual Add Scene and Duplicate Scene buttons dispatch the same public API commands that AI and scripts use.
- Clicking a scene in the visible list dispatches `project.scene.select` instead of mutating editor aliases.
- Every lifecycle mutation is canonical, transactional, undoable, serializable, macro-capable where deterministic, and preset-capable only where meaningfully reusable.
- Duplicated scenes receive a fresh scene ID and fresh source IDs while preserving editable source settings, transforms, filters, media metadata, and scene-level configuration.
- Selection changes become canonical state changes so API, AI, UI, and JSON observe the same `currentSceneId` and selection state.
- Rename preserves scene identity while changing only the human-facing label.
- Delete refuses to erase the final scene; deleting the active scene selects a deterministic surviving neighbor.
- The scene list refreshes after any canonical command, including commands invoked by AI/API rather than only manual buttons.
- Commands & History discovers all lifecycle commands automatically from metadata.
- Future mobile `Scenes` sheets can project these exact commands without a second scene system.

## Five Shapes Considered
A. Keep legacy scene buttons and add API-only scene commands — rejected because it preserves two universes.
B. Make scene UI directly call project helpers — rejected because manual actions bypass command history.
C. Make commands call legacy `scenes.js` helpers — rejected because legacy helpers depend on DOM/editor state.
D. Put all lifecycle logic inside command executors — viable but mixes project-domain rules into catalog metadata.
E. Add focused canonical project collection helpers, thin command definitions, and command-driven scene UI — selected.
