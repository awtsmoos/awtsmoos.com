# B"H — Phase Two File Map

Files to create:

- `modules/app/bootNesherStudio.js` — boot choreography and one local `changed()` bridge.
- `modules/app/nleState.js` — guarantees bin, timeline, and export plan exist.
- `modules/app/canvasBindings.js` — canvas sizing and draw clock binding.
- `modules/app/sourceBindings.js` — source creation controls and guarded media/file adds.
- `modules/app/layerBindings.js` — layer movement, duplication, removal.
- `modules/app/recordingBindings.js` — recording profile setup and record button.
- `modules/app/providerBindings.js` — provider dropdown and provider UI updates.
- `modules/app/nleBindings.js` — media bin, timeline clip placement, export probe.
- `modules/app/genericHlsController.js` — HLS runtime session, timers, health readout.

Files to rewrite:

- `main.js` — become only an entrypoint that imports and calls `bootNesherStudio()`.

Files not touched in this pass:

- `index.html`, `style.css`, `modules/state.js`, `modules/dom.js`, existing project/timeline/export engines, and tests.
