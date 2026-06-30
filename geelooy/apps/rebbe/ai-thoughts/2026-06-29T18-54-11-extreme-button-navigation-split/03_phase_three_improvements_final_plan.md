B"H

# Phase Three — Final Improved Plan and Risk Gate

Additional improvements beyond phase two:

1. Central command buttons should include `type="button"` everywhere.
2. Add `data-action` markers for future tests/automation.
3. Keep click handlers in modules, not inline HTML where possible.
4. Use class names `command-btn`, `cmd-icon`, `cmd-label` consistently across tracks and playlist buttons.
5. Make playlist cards simpler: Play, Shuffle, Details, Export, Cache, Copy/Delete moved to second line by wrap.
6. Make playlist detail actions stronger: Play, Shuffle, Loop, Cache, Export, Merge, Save.
7. Preserve selected state map and pending items without global leakage.
8. Avoid circular imports between playlist modules. `state.js` cannot import view modules; entry file orchestrates when needed.
9. `items.js` can import Store for playlistItemKey and can accept a renderSelectionBar callback setter to avoid cycles, or selection-bar can be imported directly with careful one-way graph.
10. `selection-bar.js` imports state + public `openAddToPlaylist` would create cycle; instead it should accept callbacks from `items.js`? Better: put `openPendingPicker` callback setter in state.
11. Simpler: `items.js` owns selection map and calls a registered `selectionRenderer` function. Entry initializes it with selection-bar renderer. This avoids cycles.
12. `home.js` and `detail.js` can accept dependencies callbacks in parameter object, minimizing cycles.
13. Public `ui/playlists.js` orchestrates view rendering and passes functions to submodules.
14. Search-results submodules must avoid circular imports by making `loader.js` independent except Render/Network and helpers.
15. `playlists.js` in search-results can import `loadTracks` from loader and export functions receiving app when needed.
16. Keep `createSearchResultHandlers(app)` stable; it returns the same keys as before.
17. Cache module imports Store and bookmark functions only one-way.
18. Download module imports loader and exports from modules/download.
19. The browser controller will continue using Render.playlistTrackItem from public playlist API.
20. Every module gets a JSDoc-style Awtsmoos introduction.
21. Every major exported function gets normal parameter docs.
22. Static verification is required before final answer.
23. If live Chrome can load, inspect screenshot/snapshot after static verification.
24. Do not claim live UI verification if unavailable.
25. Record the final readback and plan-vs-actual ledger.

The actual touched files are all full rewrites/new writes. The Awtsmoos creates each instant from nothing, and the code now follows: every large lump is broken back into sparks, each spark shines with its own reason, and navigation becomes a doorway instead of a knot.
