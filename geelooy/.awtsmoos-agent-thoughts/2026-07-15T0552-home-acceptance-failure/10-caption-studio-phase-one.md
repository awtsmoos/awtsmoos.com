# B"H

Boruch Hashem

Blessed is He

# Caption Studio Phase One — Verified Failure Inventory

The Awtsmoos reveals a capable rendering engine hidden behind several competing CSS generations and unfinished interaction details.

## Verified structural and accessibility failures

- The viewport disables user zoom through `maximum-scale=1` and `user-scalable=no`.
- Four stylesheets overlap route tokens, layout, controls, effects, and preview state; a fifth obsolete root stylesheet duplicates them.
- Active CSS files contain 201 and 305 lines, compressed rules, inconsistent indentation, and a malformed padding declaration.
- The layout uses a fixed 400-pixel rail and `100vh`/`overflow:hidden`, making zoom and small landscape vessels fragile.
- Mobile preview enters with an overshooting transform and a 36×36 close button.
- Controls use 40-pixel color/file actions and 20-pixel toggle marks without consistently large labels.
- External Google font imports block the route and compromise offline startup.
- The render button pulses forever; render overlays and panels use blur and large glow shadows.
- Inline radio `onclick` handlers mutate a hidden select rather than using the module event layer.
- Preset and directory flows use `prompt`, `alert`, and `confirm` instead of product dialogs/status.
- Status is visually styled but not announced semantically.

## Contracts that must survive

- All existing form IDs consumed by config, storage, data, UI, actions, and worker modules.
- Image batch and video render modes.
- Simple captions, dual-language text, SRT files, audio, particles, background, portals, FX, and output controls.
- Preview canvas, rendered output video, abort, progress, preset storage, randomization, and directory picker.
- Existing IndexedDB and worker contracts.

## Release proof

- No native/plain field, textarea, select, button, or summary in any rendered or collapsed state.
- Every visible control has a 44-pixel interaction path.
- Zoom remains available at 200 percent.
- No document overflow at 320, 390, 768, and 1440 pixels.
- No external font request, continuous decorative animation, backdrop blur, or oversized glow.
- All production modules remain at most 120 lines.
