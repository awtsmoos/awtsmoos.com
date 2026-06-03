B"H
# Repair Pass 5 — Finish the Horizontal Exile

After rereading the full active CSS import stack from `main.css`, these risks remain:

- `panel-rows.css` still allows horizontal tab scrolling with `overflow-x: auto`, `flex: 1 0 auto`, and `min-width: 92px`.
- `mobile-sidebar-reset.css` repeats the same horizontal tab scroll rules.
- `shell.css` has `overflow-x: visible` on the scroll wrapper.
- `sidebar.css` uses `width: 100vw`, which can produce viewport overflow on mobile browsers.
- `inline-comments.css` uses a rigid 3-column inline header and nowrap title.

Fix all remaining issues by rewriting complete files:

1. `shell.css`: no visible horizontal overflow anywhere. Use `overflow-x: clip/hidden` only.
2. `sidebar.css`: use `width: 100%`, not `100vw`, plus `max-width: 100%` and clip overflow.
3. `panel-rows.css`: no tab horizontal scroll; tabs wrap or stack. Student rows use one-column mobile-friendly grid.
4. `mobile-sidebar-reset.css`: final decree removes all horizontal scrolling and all min-width tab forcing.
5. `inline-comments.css`: make inline insight card a vertical, non-cramped page. Header becomes vertical/stacked on mobile; title wraps.
6. Verify risk grep has no horizontal-scroll hazards in active CSS.
7. Run CSS ownership/quality and JS syntax checks.
