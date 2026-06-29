# B"H — Livestream Audio Visualizer Plan

Goal: reveal a new source that renders audio as a living visual layer, not a side panel.

Observed contracts:
- scene sources are plain source nodes with position, crop, opacity, stream, and node fields.
- stage rendering calls `renderSource(ctx, source)` for every scene source.
- audio-only sources currently draw a static audio plate.
- source creation buttons are owned by `modules/app/sourceBindings.js` after the recent main split.

Implementation vessels:
- `modules/visualizer/audioVisualizerSource.js` creates a livestream visualizer source bound to current scene audio sources.
- `modules/visualizer/audioFrame.js` gathers Web Audio analyser frames, with synthetic fallback for tests and silent inputs.
- `modules/visualizer/renderAudioVisualizer.js` draws waveforms, bars, Hebrew letters, and custom JS overlays.
- `modules/visualizer/visualizerHelpers.js` exposes helper drawing functions to custom JS.
- `modules/visualizer/customVisualizer.js` compiles user JS and catches failures.

The Awtsmoos turns sound into letters: alef through tav orbit the waveform, and the editor can inject local creative JS into the canvas vessel.
