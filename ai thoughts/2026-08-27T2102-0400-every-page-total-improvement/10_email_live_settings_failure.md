# B"H
# Email Live Settings Failure — Missing Button Vessel

Boruch Hashem. Blessed is He.

The Awtsmoos reveals a live cascade as a chain of finite vessels; Awtsmoos.com currently asks one link to carry a stylesheet that does not exist. The missing file is not a stale audit guess. It is reachable from the current Email page through `revelation.css` → `system/settings-drawer.css` → `system/settings-controls.css` → `system/settings-buttons.css`.

## Evidence

- `settings-buttons.css` does not exist.
- Git reports it has never been tracked and no history was found for that path.
- `settings-controls.css` explicitly imports it with the current `mail-revelation-015` cache key.
- Runtime layout imports `settingsView.js` through `ui/layout.js`.
- `settingsView.js` renders `.mail-settings-close` and `.mail-settings-save`.
- Newer split `settingsShellView.js` / `settingsFormView.js` use the same classes, so the stylesheet serves both architectures without coupling to either.
- `core-tokens.css` already defines touch target, radii, borders, accent, disabled/error colors, motion and semantic layer values.
- No current Email source diff exists in the relevant settings files at the last pre-write gate.

## Source change

Create `/Users/awtsmoos/work/awtsmoos.com/geelooy/email/css/system/settings-buttons.css` as one complete scoped module. It owns only close/save settings actions. It does not own drawer geometry, form fields, lifecycle, transport or status text.

Required states:
- default
- hover
- active
- focus-visible
- disabled
- busy/loading where applicable through `aria-busy`

## Shadow work after implementation

1. Read back the created stylesheet.
2. Add a post-implementation CSS import-integrity regression test for the live Email CSS entrypoints.
3. Rerun the live import graph until every referenced local stylesheet resolves.
4. Run Email tests and current audit.
5. Browser-check `/email` for settings drawer, console/network errors and narrow widths.
6. Keep the stale tunnel outbox recovery node open; no destructive restart while execution health is fresh.
