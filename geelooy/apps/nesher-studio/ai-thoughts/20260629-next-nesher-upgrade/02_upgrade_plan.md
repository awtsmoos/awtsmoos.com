B"H

# Upgrade plan

The plan is to add small modules and rewrite only complete files that must learn new IDs/imports. No partial patching. No forbidden browser recorder API. No placeholders.

Vertical slice 1: visualizer source family registry
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/visualizer/sourceFamilyRegistry.js.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/visualizer/audioVisualizerSource.js to accept a family id and merge family defaults.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/app/sourceBindings.js to populate a family selector and create the selected family.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/index.html and modules/dom.js for the selector/button IDs.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/048_visualizer_source_family_smoke.mjs.

Vertical slice 2: live stream health model
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/live/streamStatsFormat.js.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/live/liveStreamHealth.js.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/app/genericHlsController.js to use the model.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/050_live_stream_health_smoke.mjs.

Vertical slice 3: NLE track commands
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/nle/timelineCommands.js.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/app/nleBindings.js to wire split, trim, nudge, track move, and ripple delete buttons.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/nle/renderNle.js only if the selected clip details need better display.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/051_nle_tracks_commands_smoke.mjs.

Vertical slice 4: encoding recommendation and guard
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/encodingBenchmark/benchmarkRecommendation.js.
- Rewrite /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/modules/encodingBenchmark/benchmarkMatrix.js and benchmarkReport.js to expose richer recommendations.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/049_visualizer_audio_features_smoke.mjs.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/052_encoding_recommendation_smoke.mjs.
- Add /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/nesher-studio/tests/053_no_media_recorder_guard_smoke.mjs.
