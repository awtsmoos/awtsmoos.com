# B"H

# Pass 6: NLE temporal readability and controls

## Complete files approved for rewrite

- `src/nle/ui/NLETimeRuler.js` (new)
- `src/nle/ui/NLETimelineView.js`
- `src/nle/ui/NLEToolbar.js`
- `src/nle/ui/NLEEditingActions.js`
- `src/nle/ui/NLEEventRegistry.js`

The pass adds an adaptive real time ruler, explicit track-state classes, clip-type
classes, zoom in/out controls, and a visible snap toggle through the existing store.
It preserves public commands, drag, selection, undo/redo, keyframes, packaging,
voice, media, and deterministic time evaluation.
