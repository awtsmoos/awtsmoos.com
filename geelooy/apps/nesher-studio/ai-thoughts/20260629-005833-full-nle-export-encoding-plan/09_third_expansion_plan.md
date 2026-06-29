# B"H

## Third expansion plan

Observed current app reality: main.js still uses modules/nle/bin.js, modules/nle/timeline.js, modules/nle/renderNle.js, and modules/nle/exportPlan.js. The recording path still enters modules/webcodecs/webmRecorder.js and calls startVideoFramePump from modules/recording/videoFramePump.js. Richer split modules exist but must be integrated carefully through stable entry points.

This pass will:
- Rewrite modules/recording/videoFramePump.js to use the split monotonic clock, keyframe policy, frame drop policy, queue sampler, backpressure controller, and telemetry while preserving startVideoFramePump signature and return shape.
- Rewrite modules/nle/timeline.js into a stronger UI-facing timeline facade with trim/split/ripple/select helpers while preserving createTimeline/addClip/selectClip.
- Rewrite modules/nle/renderNle.js to display track/clip metadata, selection, and export status without changing DOM ids.
- Add small coordinator modules for editor status, export negotiation, and recording runtime planning.
- Add tests 041-045 for integrated frame pump dependencies, NLE commands, render output, export negotiation, and runtime support.

Safety: no MediaRecorder token, no public API break, no piano edits.
