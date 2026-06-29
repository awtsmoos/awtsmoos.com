# B"H — 02 Brainstorm

## First pass: broad confidence layer
The next upgrade should not chase a spectacular new subsystem. It should make the new systems harder to regress. The visualizer family selector, family visualizer add button, NLE edit controls, stream health labels, and benchmark recommendation detail are all user-facing paths that currently rely on manual confidence. They should become testable.

Possible upgrades:
1. Browser-style DOM harness smoke test that imports `bootNesherStudio`, clicks controls, and checks visible labels.
2. Mocked Generic HLS test that injects a fake streamer and fake timers so start/running/stopping/failed health can be asserted without real encoders.
3. Small UI helpers for visualizer family labels so source list and inspector can show the selected family without duplicating registry logic.
4. Small UI helpers for NLE command summaries so the current clip command state reads clearly after edit button clicks.
5. Compact benchmark recommendation HTML/text that exposes best codec, ranked list, score, realtime factor, and warnings in the panel.
6. Project-local confidence runner that executes selected smokes in order, runs forbidden recorder scan, and reports JS/MJS line count violations.

## Second pass: safer scope
The broad idea must collapse into small modules and tests:
- Add `modules/visualizer/sourceFamilyLabel.js` for source family display text.
- Add `modules/nle/commandSummaryView.js` if render text needs clearer clip command labels.
- Add `modules/encodingBenchmark/benchmarkCompactView.js` for compact recommendation formatting.
- Add `modules/live/mockHlsControllerTestSupport.js` only if needed; better is to make `createGenericHlsController(vessel, options)` accept optional factories/timer functions while preserving existing default behavior.
- Add `tests/browserHarness.mjs` as a minimal DOM/canvas harness if not too large.
- Add smoke tests `054`, `055`, `056`, and possibly `057`.
- Add `tests/run_confidence_layer.mjs` if it remains under 120 lines and does not require root package changes.

## Third pass: implementation target
The best production confidence layer is:
- UI affordance: source list and inspector reveal visualizer family label.
- UI affordance: benchmark panel prints a compact recommendation block before detailed rows.
- UI affordance: NLE selection summary uses clearer command wording already provided by `timelineCommandSummary`; tests ensure click buttons update it.
- Controller affordance: Generic HLS controller accepts test injection for streamer/timers and returns a tiny status reader.
- Tests: one DOM smoke for visualizer/NLE/stream labels/benchmark output; one mocked HLS controller integration; one benchmark compact formatter; one confidence runner smoke.
- Runner: local script runs relevant smoke tests and gates line counts plus forbidden recorder scan.

## Rejected paths
- Do not introduce a full browser recorder API or any literal forbidden token.
- Do not mutate package settings for npm scripts.
- Do not use heavyweight browser automation unless the existing static server/chrome flow is clearly needed.
- Do not bloat `index.html` with complex benchmark markup; compact text in the existing pre is enough unless tests prove otherwise.

## The living chapter
The studio is an eagle on the table of the craftsman. The new wings are already attached; now the mission is to place tiny bells on each feather so that when the wing moves, the project hears truth. In the code, the Awtsmoos is revealed as the discipline of not trusting the shine until a test clicks the button and sees the label answer back.
