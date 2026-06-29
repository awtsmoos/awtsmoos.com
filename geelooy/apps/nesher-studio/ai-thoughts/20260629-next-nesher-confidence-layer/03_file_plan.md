# B"H — 03 File Plan

## Files to add
- `modules/visualizer/sourceFamilyLabel.js`
  - Export `visualizerFamilyLabel(source)` and `visualizerFamilyBadge(source)`.
  - Keep source-family display logic out of `stage.js` and `inspector.js`.
- `modules/encodingBenchmark/benchmarkCompactView.js`
  - Export `formatCompactBenchmarkRecommendation(matrix)`.
  - Turn recommendation detail into compact panel text with best codec and top ranked rows.
- `tests/browserDomHarness.mjs`
  - Provide tiny DOM/canvas mock helpers for boot-level UI tests.
- `tests/054_browser_confidence_layer_smoke.mjs`
  - Boot the app in a mocked DOM, select a visualizer family, add it, click NLE edit buttons, assert stream labels, and verify benchmark compact output can render recommendation detail.
- `tests/055_mock_generic_hls_controller_smoke.mjs`
  - Inject a fake HLS streamer into `createGenericHlsController`, exercise start/running/stopping/failure transitions, and assert readable summary output.
- `tests/056_benchmark_compact_view_smoke.mjs`
  - Verify compact best/ranked recommendation output independent of browser WebCodecs.
- `tests/run_confidence_layer.mjs`
  - Run relevant smoke tests in order, include active forbidden recorder scan, and report line-count violations.

## Files to rewrite completely
- `modules/app/genericHlsController.js`
  - Preserve default behavior.
  - Add optional `options` param with `createStreamer`, `setInterval`, `clearInterval`, and possibly `framePump` injection.
  - Expose `snapshot()` for tests.
  - Make `stop()` safe when no stream is active.
- `modules/stage.js`
  - Import family badge helper.
  - Add source family label to source row details when available.
- `modules/inspector.js`
  - Import family label helper.
  - Add selected visualizer family text to inspector meta.
- `modules/encodingBenchmark/benchmarkReport.js`
  - Reuse compact view in matrix formatting, while preserving existing plain row output and `publicMatrixJson`.
- Possibly `modules/encodingBenchmark/benchmarkPanel.js`
  - Only if panel output needs a clearer compact block. It may already improve through `formatBenchmarkMatrix`.

## Files not to touch
- Root `package.json` unless absolutely necessary; no need for this mission.
- Any unrelated dirty files outside `geelooy/apps/nesher-studio`.
- Historical `ai-thoughts` folders except the new mission folder.

## Compatibility requirements
- `makeAudioVisualizerSource(state, customJs)` must keep treating code-looking second arg as custom JS.
- `makeAudioVisualizerSource(state, familyId, customJs)` must keep selecting a family and applying custom JS.
- Existing smoke tests `048` through `053` must remain passing.
- The forbidden recorder scan must remain active and must not be defeated by new files.

## Line-count plan
Every added or touched JS/MJS file must remain under 120 lines. If a file approaches the limit, split helpers into a new tiny module instead of compressing logic into unreadable knots.
