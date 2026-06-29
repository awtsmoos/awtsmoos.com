# B"H

## Second expansion audit

User asked to keep expanding beyond tests: split encoding libraries, make the path lightning fast from real docs, and improve the NLE/UI foundation.

Docs applied:
- WebCodecs VideoEncoder exposes encodeQueueSize and dequeue for queue/backpressure scheduling.
- VideoEncoder configuration includes hardwareAcceleration and latencyMode hints.
- VideoEncoder is available in dedicated workers in supporting browsers.
- VideoEncoder.isConfigSupported is the proper support probe before promising a profile.
- Mediabunny documents browser-side media writing/conversion including MP4 and WebM, but packet replacement remains experimental until locally proven.

Files added in this second pass:
- modules/recording/core/WebCodecsFeatureGate.js
- modules/recording/core/EncoderRuntimeSupport.js
- modules/recording/core/EncodeQueueSampler.js
- modules/recording/core/EncoderBackpressureController.js
- modules/recording/core/EncodingTelemetry.js
- modules/recording/worker/workerMessages.js
- modules/recording/worker/workerState.js
- modules/recording/worker/workerMuxBridge.js
- modules/recording/worker/workerClient.js
- modules/recording/worker/recordingWorker.js
- modules/recording/audio/opusProfiles.js
- modules/recording/audio/audioTimestampPolicy.js
- modules/recording/audio/audioEncoderFactory.js
- modules/export/containers/ContainerSupportProbe.js
- modules/export/containers/MediabunnyPacketBridge.experimental.js
- modules/export/containers/WebmExport.js
- modules/export/containers/Mp4Export.js
- modules/timeline/ClipModel.js
- modules/timeline/TrackModel.js
- modules/timeline/TimelineModel.js
- modules/timeline/TimelineCommands.js
- modules/timeline/TimelineTrim.js
- modules/timeline/TimelineSplit.js
- modules/timeline/TimelineSnap.js
- modules/timeline/TimelineZoom.js
- modules/ui/LayoutMode.js
- modules/ui/PanelTabs.js
- modules/ui/Toolbar.js
- modules/ui/CommandPalette.js
- modules/inspector/InspectorModel.js
- tests/035_recording_core_smoke.mjs
- tests/036_worker_messages_smoke.mjs
- tests/037_audio_encoding_profiles_smoke.mjs
- tests/038_container_support_smoke.mjs
- tests/039_timeline_editing_smoke.mjs
- tests/040_ui_inspector_smoke.mjs

Files fully rewritten for compatibility:
- modules/timeline/TimelineHistory.js now preserves createTimelineHistory, pushHistory, undoTimeline, redoTimeline, and pushTimelineHistory.
- modules/timeline/TimelineSelection.js now preserves createTimelineSelection and selectTimelineClip while also supporting newer helpers.

Verification:
- tests 019 through 040 passed.
- tests/012_source_render_timeline_smoke.mjs passed after TimelineHistory/TimelineSelection compatibility rewrite.
- Forbidden recorder token grep returned no output.
- New split modules checked for line counts over 120; no individual file was reported.
- Existing Node module type warnings remain, not introduced as test failures.

Still not complete:
- Worker recorder is scaffolded and API-shaped, not wired into startWebCodecsWebmRecorder yet.
- UI modules are model-level foundations, not rendered into main.js yet.
- MP4/Mediabunny packet bridge is intentionally experimental, disabled by default.
- Browser permission flows and actual encode performance profiling still need interactive verification.
