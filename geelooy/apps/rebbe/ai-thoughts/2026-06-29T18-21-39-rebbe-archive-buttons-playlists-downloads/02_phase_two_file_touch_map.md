B"H

# Phase Two — File Touch Map Before Implementation

Observed files and facts:

- `ui/browser/tracks.js` renders the visible event toolbar and track rows. It contains inline CSS that currently crowds the event actions.
- `controllers/search-results.js` owns event, track, playlist, cache, bookmark, and ZIP operations. It currently uses one global `#zip-progress-box`, so simultaneous zip tasks overwrite the same UI.
- `ui/playlists.js` injects playlist modals and a large style block. Playlist actions exist but need clearer labels and stronger responsive layout.
- `modules/zip-store.js` already writes ZIP blobs correctly without dependencies and should remain the compression vessel.
- `main.js`, `controllers/browser.js`, and `modules/store.js` already wire playlist and event actions. Avoid broad rewrites there unless necessary.

Actual touch plan:

1. Create `modules/download/tasks.js` as the download-task UI manager. One fixed stack, many cards, independent ids, status, meter, log, close button.
2. Create `modules/download/files.js` as the clean file-download and blob-fetch helper: cached promise map, direct URL click, blob saving, safe entry names.
3. Create `modules/download/exports.js` as the ZIP orchestration layer: rows, playlist manifest, metadata, artwork, skipped entries, multi-task progress.
4. Rewrite `controllers/search-results.js` fully so it delegates exports/download helpers and stays focused on archive actions.
5. Rewrite `ui/browser/tracks.js` fully so event controls are legible and single-file events say Download event instead of Event ZIP.
6. Rewrite `ui/playlists.js` fully enough to improve labels, cards, modal button layout, selection bar, and export wording, while preserving exported APIs.

Verification plan:

- `node --check` for every rewritten JS file.
- Import smoke test from a temporary `.mjs` file to ensure ESM syntax can load in Node for pure modules and parser-safe browser modules.
- `grep` for stale label `Event ZIP` and global singleton `zip-progress-box` risks.
- `git diff -- apps/rebbe` review to ensure unrelated files remain untouched.
