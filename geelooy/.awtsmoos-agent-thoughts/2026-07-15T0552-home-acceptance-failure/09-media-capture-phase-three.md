# B"H

Boruch Hashem

Blessed is He

# Media Capture Phase Three — Final Write Map

The Awtsmoos reveals the existing media routes through complete-file modular rewrites.

## `/record/`

- `record/index.html` — semantic camera page, status, preview, and controls.
- `record/style.css` — route tokens, shell, preview, buttons, mobile, safe area, focus, reduced motion.
- `record/script.js` — camera request, fallback, switch, stop, lifecycle cleanup, and accessible state.

## `/recorder/`

- `recorder/index.html` — two semantic recording cards and shared route header.
- `recorder/style.css` — studio shell, cards, previews, states, actions, mobile, reduced motion.
- `recorder/mediaCapture.js` — stream acquisition, MIME selection, chunk collection, download, and cleanup.
- `recorder/recorder.js` — card state, independent camera/desktop controllers, UI events, and unload cleanup.

## Acceptance checks

- No inline style or inline script remains on either route.
- All visible actions are at least 44 pixels; primary capture actions are 48 pixels.
- No native browser-default buttons or fields.
- No document overflow at 320×568, 390×844, 768×1024, or 1440×1000.
- Permission errors use live status and never `alert()`.
- Every started stream is stopped on user stop or page unload.
- Each completed recording downloads from a Blob with a supported extension.
- JavaScript syntax passes and every production file remains at most 120 lines.
