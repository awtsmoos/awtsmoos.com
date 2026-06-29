B"H
# Post Write Audit — Manual WebCodecs Speed + Aspect

## What changed
- Removed the realtime browser-recorder path from active code and tests.
- Deleted the old realtime recorder helper modules:
  - `modules/recording/realtimeMediaRecorder.js`
  - `modules/recording/mediaRecorderMime.js`
  - `modules/recording/fastAudioTracks.js`
- Replaced the UI engine chooser with a manual WebCodecs profile chooser.
- Default profile is now `speed-vp8`, a faster manual WebCodecs VP8 path.
- Added `balanced-vp9` and `quality-vp9` manual profiles for higher quality.
- Added queue-aware manual `VideoEncoder` pumping. If the encode queue grows too large, frames are dropped intentionally so recording stays responsive.
- Added direct single-source audio mode. One external/window audio track is cloned and sent straight to WebCodecs `AudioEncoder` instead of being mixed first.
- Multiple audio sources still flow through the browser audio graph, then into WebCodecs `AudioEncoder` as Opus.
- Increased profile audio bitrate to 160k/192k depending on profile.
- Added locked-aspect resizing controls by default with an explicit unlock checkbox.
- Added aspect ratio selector and Swap W/H button.

## Files touched
- `index.html`
- `main.js`
- `style.css`
- `modules/state.js`
- `modules/dom.js`
- `modules/recorder.js`
- `modules/recording/aspectRatio.js`
- `modules/recording/manualRecordingProfile.js`
- `modules/recording/manualAudioSource.js`
- `modules/recording/audioMix.js`
- `modules/recording/audioEncoder.js`
- `modules/recording/recorderGuards.js`
- `modules/recording/videoFramePump.js`
- `modules/recording/webmMuxerFactory.js`
- `modules/recording/sizeControls.js`
- `modules/webcodecs/webmRecorder.js`
- `modules/webcodecs/hlsTsStreamer.js`
- `tests/021_manual_profiles_smoke.mjs`
- `tests/022_aspect_ratio_controls_smoke.mjs`
- `tests/023_manual_audio_source_smoke.mjs`

## Verification
- `grep -R "MediaRecorder" index.html main.js modules tests` returned no forbidden references.
- Stale symbol grep for `recordingEngine`, `realtimeMediaRecorder`, `mediaRecorderMime`, and `fastAudioTracks` returned no active app/test references.
- Syntax checks passed for the manual recorder, aspect controls, state, DOM, and tests.
- Smoke tests passed:
  - resolution presets
  - audio source discovery
  - manual profile defaults
  - locked aspect sizing
  - direct manual audio source
- Touched files were read back after writing.

## Runtime handoff
A true browser recording with permissioned external window audio still needs to be tested in Chrome. Expected default path: `Manual Profile = Speed · VP8 realtime`, aspect lock enabled, direct audio status for one audio source, and a visible download link after stop.
