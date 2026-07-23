<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Final File Plan

Git history revealed a ChatGPT-only audio option shelf, not a universal active message menu. Its live class also diverged from the main `.audio-offer` CSS selector. The implementation therefore restores that historical intent through a universal, accessible message action system rather than reviving obsolete monolithic code.

## Complete file graph

- Message transfer, media discovery, item derivation, keyboard navigation, menu lifecycle, and a narrow public index live in `js/render/message-actions/`.
- Shell decoration helpers live in `js/render/runtime/shellDecorations.js`.
- `shellRuntime.js` mounts and refreshes one action menu per visible text message.
- `audioControls.js` preserves synthesis behavior while exposing its panel through the menu.
- Focused CSS modules own message actions, audio options, and desktop proportions.
- Focused Node tests cover media classification and safe filenames.

## Verification gate

All touched files will be reread completely, syntax checked, line-counted, diff checked, tested, and visually smoke tested before completion is claimed.
