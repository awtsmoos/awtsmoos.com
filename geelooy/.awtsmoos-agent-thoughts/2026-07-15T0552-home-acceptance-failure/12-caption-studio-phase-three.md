# B"H

Boruch Hashem

Blessed is He

# Caption Studio Phase Three — Final Write Map

The Awtsmoos preserves the existing worker renderer and every consumed DOM identifier while replacing the route shell, styling, and blocking interaction layer completely.

## Production files rewritten

- `apps/captions/video/index.html`
  - Accessible viewport, semantic control rail, persistent labels, live status, preset dialog, preview sheet, and unchanged renderer IDs.
- `apps/captions/video/style.css`
  - Single manifest; no competing direct stylesheet links.
- `apps/captions/video/css/variables.css`
  - Local system fonts and restrained route tokens.
- `apps/captions/video/css/layout.css`
  - Desktop studio shell, control rail, scroll region, preview containment.
- `apps/captions/video/css/components.css`
  - Fieldsets, headings, rows, helper copy, and general component structure.
- `apps/captions/video/css/fields.css`
  - Text, number, textarea, select, file, color, and range ownership.
- `apps/captions/video/css/choices.css`
  - Caption-source tabs, switch rows, FX cards, and randomization affordances.
- `apps/captions/video/css/actions.css`
  - Header tools, preview/render, folder, close, abort, and dialog actions.
- `apps/captions/video/css/effects.css`
  - Progress and render state without blur, glow loops, or decorative animation.
- `apps/captions/video/css/responsive.css`
  - Tablet, phone, landscape, safe-area, zoom, and reduced-motion behavior.
- `apps/captions/video/js_modules/events.js`
  - One event layer for rendering, mobile preview, source radios, files, directory picker, and preset dialog triggers.
- `apps/captions/video/js_modules/storage.js`
  - Small compatibility facade.
- `apps/captions/video/js_modules/settingsStore.js`
  - IndexedDB initialization and settings persistence.
- `apps/captions/video/js_modules/presetStore.js`
  - Preset CRUD and select refresh without browser dialogs.
- `apps/captions/video/js_modules/presetDialog.js`
  - In-page save/delete confirmation and validation.
- `apps/captions/video/main.js`
  - Resilient boot status and initialization ordering.

## Contracts preserved exactly

- Existing worker file, messages, render actions, data extraction, downloads, IndexedDB database/store names, preview canvas, output video, progress bar, and all IDs consumed by `config.js`.
- Image batch and video modes.
- Simple and SRT caption sources.
- Dual captions, audio, particles, background, portals, FX, output folder, presets, preview, render, and abort.

## Acceptance gate

1. All JavaScript modules parse.
2. Every referenced stylesheet and module resolves.
3. Every production file is at most 120 lines.
4. 320×568, 390×844, 768×1024, and 1440×1000 have no document overflow.
5. Default and hidden controls have no browser-default paint.
6. Visible controls have at least a 44-pixel interaction path.
7. Zoom is enabled and layout remains usable at 200 percent.
8. No external font request, backdrop blur, infinite animation, prompt, alert, confirm, or inline event handler remains.
9. Console and runtime exception receipts remain clean before render permission/file interaction.
