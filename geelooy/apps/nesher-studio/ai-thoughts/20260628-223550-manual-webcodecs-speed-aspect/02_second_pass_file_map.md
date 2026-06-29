B"H
# Second Pass File Map

## Whole rewrites
- `index.html`: remove recording engine choice, add manual WebCodecs profile, aspect lock, ratio select, swap button.
- `style.css`: compact controls for the new layout.
- `modules/dom.js`: expose `recordingProfile`, `aspectLock`, `aspectRatio`, `swapSize`; remove `recordingEngine`.
- `modules/recorder.js`: always call `startWebCodecsWebmRecorder` with profile ID.
- `modules/recording/sizeControls.js`: lock aspect by default and apply smart ratio behavior.
- `modules/recording/recorderGuards.js`: generic supported video/audio config helpers.
- `modules/recording/videoFramePump.js`: queue-aware manual frame pump with drops.
- `modules/recording/webmMuxerFactory.js`: dynamic VP8/VP9 + Opus mux settings.
- `modules/webcodecs/webmRecorder.js`: manual-only orchestrator.
- `modules/recording/audioEncoder.js`: direct/mixed track encoder.
- `modules/recording/audioMix.js`: fix source count and keep mixing stable.

## New files
- `modules/recording/aspectRatio.js`.
- `modules/recording/manualRecordingProfile.js`.
- `modules/recording/manualAudioSource.js`.
- `tests/021_manual_profiles_smoke.mjs`.
- `tests/022_aspect_ratio_controls_smoke.mjs`.
- `tests/023_manual_audio_source_smoke.mjs`.

## Deletes
- `modules/recording/realtimeMediaRecorder.js`.
- `modules/recording/mediaRecorderMime.js`.
- `modules/recording/fastAudioTracks.js`.
- Old MediaRecorder tests `021` and `022` will be rewritten to manual WebCodecs tests.

## Verification
- `grep -R MediaRecorder index.html main.js modules tests` must produce no app/test references.
- `node --check` on touched JS.
- Manual profile, aspect, audio source, existing size/audio tests.
