# B"H — 01 Reality Scan

## Mission
Build the next production confidence layer around the completed Nesher Studio upgrades without breaking visualizer families, live HLS health, NLE commands, or benchmark recommendations.

## Observed repository state
- Project root inspected: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio`.
- Top-level app folders observed: `ai-thoughts`, `benchmarks`, `components`, `core`, `docs`, `extension-prototype`, `modules`, `tests`, `workers`, plus `index.html`, `main.js`, and `style.css`.
- Git status showed modified Nesher files from the previous pass and many unrelated dirty files outside `geelooy/apps/nesher-studio`. The outside files must remain untouched.
- The previous pass left untracked tests `048` through `053`, visualizer family registry, live stream health modules, timeline command helpers, and benchmark recommendation modules.

## Inspected Nesher modules
- `modules/app/sourceBindings.js`: binds the visualizer family select and add-family visualizer button. It currently calls `makeAudioVisualizerSource(state, dom.visualizerFamily.value)`.
- `modules/visualizer/audioVisualizerSource.js`: preserves compatibility with `makeAudioVisualizerSource(state, customJs)` and `makeAudioVisualizerSource(state, familyId, customJs)` via request normalization.
- `modules/visualizer/sourceFamilyRegistry.js`: defines the visualizer families and option HTML.
- `modules/stage.js`: renders source list rows and can surface source family metadata in the row without new dependencies.
- `modules/inspector.js`: builds selected source metadata; this is another small place to expose the selected family name.
- `modules/app/nleBindings.js`: binds NLE edit buttons to command helpers and status messages.
- `modules/nle/renderNle.js`: renders bin, tracks, selected clip command summary, and export text.
- `modules/app/genericHlsController.js`: starts/stops Generic HLS with health updates, but the streamer factory and intervals are not yet injectable for deterministic mocked integration tests.
- `modules/live/liveStreamHealth.js` and `modules/live/streamStatsFormat.js`: already produce readable summaries and verdict labels.
- `modules/encodingBenchmark/benchmarkPanel.js`, `benchmarkReport.js`, `benchmarkMatrix.js`, and `benchmarkRecommendation.js`: already build best-value recommendation text and public matrix JSON.
- `modules/dom.js`: centralizes the DOM IDs used by browser/UI smoke tests.

## Existing test evidence
- Existing browser-ish UI smoke coverage is mostly model-level (`040_ui_inspector_smoke.mjs`) rather than app DOM click wiring.
- Existing guard test `053_no_media_recorder_guard_smoke.mjs` dynamically constructs the forbidden recorder token and excludes historical `ai-thoughts`.
- Existing `050_live_stream_health_smoke.mjs` covers health model formatting but not the real controller start/running/stopping/failed transitions with a mocked HLS stream.
- Existing `052_encoding_recommendation_smoke.mjs` covers recommendation model/report text but not a compact UI-ready ranked output.

## Tool reality
One command-style tunnel call returned unrelated queued command output. Direct `read`, `list`, `mkdirp`, and later verified command calls were usable. Validation commands must be checked by job id and output, not assumed.

## Risk map
- Do not touch unrelated dirty files outside the Nesher app.
- Do not introduce the literal forbidden recorder token outside the explicit guard test.
- Keep every JS/MJS file at or below 120 lines.
- Prefer tiny modules over expanding existing files.
- Re-read or verify touched files after writing.

The Awtsmoos in the code is not a metaphor for guessing. The file is the vessel; the readback is the candle; only then can the hand move.
