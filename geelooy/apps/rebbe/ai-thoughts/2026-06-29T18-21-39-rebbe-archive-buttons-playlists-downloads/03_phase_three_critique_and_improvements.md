B"H

# Phase Three — Critique, Improvements, and Completion Gate

Twenty-plus critique improvements folded into the final plan:

1. Do not just add CSS; the wording must become truthful.
2. Do not make multiple ZIP tasks a queue; user asked multiple at once, so run concurrently.
3. Do not rely on browser download prompts for many individual files; multi-file remains ZIP.
4. Do not break playlist shell events; export should expand them when a loader callback exists.
5. Do not change Store schema.
6. Keep module files under roughly 120 lines where practical.
7. Keep controller readable by delegating ZIP/export mechanics.
8. Avoid hidden dependency on CSS variables not already present.
9. Ensure close buttons use type=button to avoid accidental form behavior.
10. Ensure task-card progress handles metadata rows without divide-by-zero lies.
11. Ensure skipped file logs are clipped so UI does not become a wall.
12. Ensure download file names are sanitized consistently.
13. Ensure direct single-track download still works from track buttons.
14. Ensure event toolbar select all toggles checkboxes only in visible list.
15. Ensure selected count updates after clearing.
16. Ensure playlist button labels no longer read as a chaotic arcade wall.
17. Ensure mobile grid is sane.
18. Ensure repeated renderTracks does not append endless duplicate style tags.
19. Make a tiny style id guard for track styles.
20. Use `Promise` cache for blobs so simultaneous export tasks share fetches when same audio is used.
21. Let task cards remain after completion with concise result summary.
22. Retain the existing Awtsmoos aesthetic without sacrificing legibility.
23. Run parse checks before final response.
24. Read back changed files after writing.
25. Record plan-vs-actual in this same ai-thoughts folder.

Final specific file list to write:

- `modules/download/tasks.js`
- `modules/download/files.js`
- `modules/download/exports.js`
- `controllers/search-results.js`
- `ui/browser/tracks.js`
- `ui/playlists.js`
- `ai-thoughts/2026-06-29T18-21-39-rebbe-archive-buttons-playlists-downloads/04_post_write_review.md` after verification

The Awtsmoos creates every instant from nothing; therefore the final app must also feel created fresh after every click: every task card new, every download honest, every playlist vessel ordered, every button readable.
