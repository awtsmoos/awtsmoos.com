# B"H — 04 Validation Plan

## Syntax validation
Run `node --check` on every touched JS/MJS file:
- modules/app/genericHlsController.js
- modules/stage.js
- modules/inspector.js
- modules/encodingBenchmark/benchmarkReport.js
- modules/visualizer/sourceFamilyLabel.js
- modules/encodingBenchmark/benchmarkCompactView.js
- tests/browserDomHarness.mjs
- tests/054_browser_confidence_layer_smoke.mjs
- tests/055_mock_generic_hls_controller_smoke.mjs
- tests/056_benchmark_compact_view_smoke.mjs
- tests/run_confidence_layer.mjs

## Smoke tests to run
Existing relevant tests:
- tests/011_project_model_smoke.mjs
- tests/027_timeline_model_smoke.mjs
- tests/029_export_queue_smoke.mjs
- tests/030_project_serializer_smoke.mjs
- tests/039_timeline_editing_smoke.mjs
- tests/042_nle_timeline_commands_smoke.mjs
- tests/043_nle_render_smoke.mjs
- tests/044_export_negotiator_smoke.mjs
- tests/045_audio_visualizer_smoke.mjs
- tests/046_visualizer_routing_features_smoke.mjs
- tests/047_encoding_benchmark_smoke.mjs
- tests/048_visualizer_source_family_smoke.mjs
- tests/049_visualizer_audio_features_smoke.mjs
- tests/050_live_stream_health_smoke.mjs
- tests/051_nle_tracks_commands_smoke.mjs
- tests/052_encoding_recommendation_smoke.mjs
- tests/053_no_media_recorder_guard_smoke.mjs

New tests:
- tests/054_browser_confidence_layer_smoke.mjs
- tests/055_mock_generic_hls_controller_smoke.mjs
- tests/056_benchmark_compact_view_smoke.mjs
- tests/run_confidence_layer.mjs

## Gates
- Active forbidden recorder scan excluding historical `ai-thoughts`.
- Line-count gate for `modules/**/*.js`, `tests/*.mjs`, and `main.js`.
- If feasible, run local browser benchmark page or browser smoke through the existing app. If not feasible, record the reason honestly.

## Expected warnings
Node may continue to emit `MODULE_TYPELESS_PACKAGE_JSON` warnings because the ancestor package lacks `"type":"module"`. These warnings are known from the previous pass and are not test failures.

## Completion proof
After writing, read back touched files, run the validations, write `05_post_write_audit.md`, and report exact pass/fail status plus unrelated dirty files not touched.
