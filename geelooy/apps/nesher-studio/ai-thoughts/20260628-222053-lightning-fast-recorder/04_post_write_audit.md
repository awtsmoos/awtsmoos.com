B"H
# Post Write Audit — Lightning Fast Recorder

## What changed
- Default recording engine is now `Fast realtime WebM`, based on `canvas.captureStream` plus browser `MediaRecorder`.
- `WebCodecs quality WebM` remains available from the engine dropdown for slower/manual VP9+Opus experiments.
- External/window audio now uses a direct cloned MediaStreamTrack when there is one live audio source, avoiding the previous WebCodecs audio transcode path that could garble audio.
- Multiple audio sources still use the browser audio mixer before being handed to MediaRecorder.
- MediaRecorder starts with a 500 ms timeslice, so recording chunks are produced during capture and stop/finalize should be near-instant.
- Every fast recording cleans the capture-stream tracks and cloned audio track on stop so another recording can start without refresh.
- Downloads now go into a visible Recordings shelf and remain clickable if Chrome blocks repeated automatic downloads.

## Files touched
- `index.html`
- `style.css`
- `modules/download.js`
- `modules/dom.js`
- `modules/recorder.js`
- `modules/recording/sourceAudio.js`
- `modules/recording/mediaRecorderMime.js`
- `modules/recording/fastAudioTracks.js`
- `modules/recording/realtimeMediaRecorder.js`
- `tests/021_media_recorder_mime_smoke.mjs`
- `tests/022_fast_audio_tracks_smoke.mjs`

## Verification
- Syntax checks passed for touched JS.
- Existing resolution preset smoke test passed.
- Existing audio-source discovery smoke test passed.
- New MediaRecorder MIME test passed.
- New direct audio attachment test passed.
- HTML ID check passed for `recordingEngine`, `downloadList`, `recordButton`, `stage`, and `resolutionPreset`.
- All touched files were read back.

## Browser runtime handoff
A final real permissioned test should record an external window with audio using the default `Fast realtime WebM` engine. Expected status: direct audio track, near-instant stop, file link in Recordings shelf, and the ability to start another recording immediately.
