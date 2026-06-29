# B"H

## Third expansion audit

Implemented in this pass:
- Rewrote modules/recording/videoFramePump.js to consume the split recording modules for queue sampling, backpressure, telemetry, monotonic timestamps, and keyframe policy while preserving startVideoFramePump(...).
- Rewrote modules/nle/timeline.js into a stronger app-facing NLE facade with add/select/trim/split/move/ripple-delete/summary while preserving createTimeline, addClip, selectClip.
- Rewrote modules/nle/renderNle.js to show richer timeline/bin/export details without changing DOM ids.
- Rewrote modules/nle/exportPlan.js to use the export container negotiator and stable WebM-first policy.
- Added modules/export/pipeline/ExportNegotiator.js.
- Added modules/recording/session/RecordingRuntimePlan.js.
- Added modules/ui/EditorStatusModel.js.
- Added tests 041-045.

Failure found and fixed:
- tests/042_nle_timeline_commands_smoke.mjs exposed that splitClip used a parameter named id that shadowed the internal id generator. I rewrote modules/nle/timeline.js fully, renamed the generator to makeId, and reran the failed tests successfully.

Verification:
- tests 011 through 045 passed.
- Forbidden recorder token grep returned no output.
- Current-pass touched files line-count check reported no file over 120 lines.
- Existing Node MODULE_TYPELESS_PACKAGE_JSON warnings remain, not test failures.

Remaining:
- Worker encoder is still planned/scaffolded; main active recorder remains main-thread manual WebCodecs.
- NLE UI has model/render improvements but no pointer drag/trim handles wired into main.js yet.
- MP4 path remains experimental/guarded.
