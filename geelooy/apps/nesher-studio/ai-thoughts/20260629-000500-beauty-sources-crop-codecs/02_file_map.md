B"H
# File Map

Whole-file rewrites planned:
- `index.html`: add source bar buttons, hidden file inputs, source inspector/crop controls, top/bottom buttons, prettier structure.
- `style.css`: richer visual design, source toolbar, inspector, crop fields.
- `modules/dom.js`: add new controls.
- `main.js`: bind new source actions and inspector events.
- `modules/sources.js`: add image/video/audio file sources, display/webcam/audio-only options.
- `modules/stage.js`: click empty canvas to deselect; refresh inspector; drag crop-safe.
- `modules/layers.js`: move top/bottom.
- `modules/graph/sceneGraph.js`: move-to-edge helpers.
- `modules/graph/sourceNode.js`: default crop object.
- `modules/renderers/sourceRenderers.js`: draw crop, media, audio-only plates.
- `modules/renderers/sceneRenderer.js`: prettier overlays.
- `modules/recording/manualRecordingProfile.js`: add better quality-speed knobs.
- `modules/recording/videoFramePump.js`: use dequeue scheduling and profile queue policy.

New tests:
- layer edge movement test.
- crop math/source render helper test if needed.

No partial patching: every touched file will be rewritten fully.
