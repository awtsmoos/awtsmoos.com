# B"H

Boruch Hashem

Blessed is He

# Caption Studio Phase Two — Unified Product Architecture

The Awtsmoos keeps the existing Ein Sof renderer while replacing its layered visual history with one calm, fast studio.

## Route shell

- A semantic two-column studio: controls and preview.
- The control rail owns a compact route identity, preset controls, scrollable settings, truthful status, progress, and fixed render actions.
- The preview owns canvas, output video, mobile close, render overlay, and abort.
- Tablet and phone layouts stack without fixed-width overflow; preview opens as a contained full-viewport sheet.

## CSS ownership

- `style.css` becomes one manifest.
- `css/tokens.css` owns surfaces, text, semantic colors, spacing, radii, and type.
- `css/shell.css` owns body, grid, rail, headers, scroll region, and preview frame.
- `css/fields.css` owns labels, text/number/select/textarea/file/color/range controls, placeholders, focus, disabled, and validation.
- `css/choices.css` owns tabs, switch labels, FX cards, and randomization controls.
- `css/actions.css` owns preset, preview, render, folder, close, and abort actions.
- `css/status.css` owns status, progress, render overlay, hidden states, and semantic tones.
- `css/responsive.css` owns tablet, phone, landscape, safe-area, zoom, and reduced motion.

## Runtime improvements

- Remove inline `onclick`; one module synchronizes caption-source radios and hidden select.
- Replace directory-picker alert with the route status region.
- Replace preset prompt/alert/confirm with a compact in-page dialog using existing preset storage.
- Make boot state visible and recoverable if IndexedDB or worker initialization fails.
- Keep preview/render work unchanged except for accessible status and cancellation presentation.

## Performance improvements

- Remove external font requests.
- Remove backdrop filters, infinite pulse, continuous glow, and overshoot animation.
- Keep canvas/worker rendering isolated from layout.
- Use transform/opacity only for mobile preview opening.
- Preserve settings persistence without opening unrelated databases.
