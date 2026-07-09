# B"H — File plan

Full-file rewrites only. Touch list:

1. `apps/code/js/session/account-panel.js` — replace inline portal/action sprawl with a single account trigger and dropdown. Remove runtime style injection. Preserve login/current/logout/refresh behavior.
2. `apps/code/js/civilization/index.js` — replace five separate launcher buttons with one compact `CIV` launcher and a dropdown menu. Preserve opening cockpit/search/card/object inspector and mode cycling.
3. `apps/code/css/session/account-panel.css` — new explicit account dropdown styling.
4. `apps/code/css/civilization/launcher.css` — new explicit civilization launcher dropdown styling.
5. `apps/code/css/shell/topbar.css` — topbar containment/ordering/responsiveness so account and action clusters stop blowing out the toolbar.
6. `apps/code/css/app.css` — full rewrite to import the new modules near the end so overrides win.

Verification:
- Read all touched files.
- Count lines, keep new modules small.
- Run `node --check` on rewritten JS.
- Compile compact `apps/code/js/main.js` from the geelooy root to verify the compact runtime can fold these modules.
- Optionally fetch/check live compact cache, noting whether server still serves older content.
