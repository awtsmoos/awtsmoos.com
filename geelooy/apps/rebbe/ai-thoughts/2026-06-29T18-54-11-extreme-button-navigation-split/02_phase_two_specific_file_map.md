B"H

# Phase Two — Specific File Map

Observed current pain:

- `ui/playlists.js` is 144 lines with rendering, state, shell, styling, binding, and helpers all in one file.
- `ui/browser/tracks.js` is 130 lines with toolbar, rows, command construction, selection, cache, and CSS all together.
- `controllers/search-results.js` is 146 lines and mixes public handler map, load/navigation, downloads, cache, bookmarks.
- New download modules are okay in size but can remain as stable helpers.

Actual rewrite/split plan:

Track browser files:

- `ui/browser/tracks.js` — public renderTracks only.
- `ui/browser/tracks/commands.js` — command button component.
- `ui/browser/tracks/toolbar.js` — event command deck.
- `ui/browser/tracks/row.js` — track row construction.
- `ui/browser/tracks/selection.js` — selected count/select all logic.
- `ui/browser/tracks/cache.js` — cache dot status.
- `ui/browser/tracks/styles.js` — injected CSS, stronger bigger buttons.

Playlist files:

- `ui/playlists.js` — public API wrapper only.
- `ui/playlists/state.js` — callback/pending/selected state.
- `ui/playlists/items.js` — playlist item factories and selection helpers.
- `ui/playlists/shell.js` — mount shell/modal and global buttons.
- `ui/playlists/home.js` — playlist cards and home binding.
- `ui/playlists/detail.js` — detail view and row binding.
- `ui/playlists/picker.js` — add-to-playlist picker.
- `ui/playlists/selection-bar.js` — sticky selected UI.
- `ui/playlists/html.js` — shell HTML/cards shared helpers.
- `ui/playlists/styles.js` — playlist/studio styles.
- `ui/playlists/format.js` — esc/date/bytes/time/css helpers.

Search action files:

- `controllers/search-results.js` — public handler factory only.
- `controllers/search-results/loader.js` — loadTracks cache.
- `controllers/search-results/navigation.js` — openResult.
- `controllers/search-results/playlists.js` — playlist add/export/cache/remove.
- `controllers/search-results/downloads.js` — search selected/event/track downloads.
- `controllers/search-results/cache.js` — cache event/track.
- `controllers/search-results/bookmarks.js` — bookmark event/track.

Verification:

- Use full rewrites via heredoc only.
- Run `node --check` on all new/changed files.
- Run ESM import smoke test for public modules and created submodules.
- Run grep for old labels / stale direct references.
- Run line count gate to catch large files.
