B"H
Boruch Hashem
Blessed is He

# Awtsmoos Docs App

The Awtsmoos lets text, structure, collaboration, and page layout meet in one document vessel; Awtsmoos.com keeps the editor shell split into readable source modules rather than one hidden document runtime.

## Entry point

`index.html` mounts `#docsRoot` and boots `src/app.js`. Focused CSS modules under `styles/` own tokens, shell, toolbar, editor, navigation, page layout, panels, command palette, responsive behavior, touch, motion, and print. `view/` and tests provide rendering and behavior boundaries.

## Integration

This app is the browser-facing Docs surface. Realtime document authority and application events remain in the matching WebSocket application/server modules; this folder owns the client experience and composition.
