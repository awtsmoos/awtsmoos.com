B"H
# File Map for Lightning Pass

## Whole files to rewrite
- `index.html` add recording engine dropdown and download shelf.
- `modules/dom.js` expose `recordingEngine`.
- `modules/download.js` persist download links instead of revoking immediately.
- `modules/recorder.js` choose default fast MediaRecorder or WebCodecs quality.
- `modules/recording/sourceAudio.js` add unique stream helper.

## New smaller modules
- `modules/recording/mediaRecorderMime.js` choose the fastest supported WebM MediaRecorder MIME.
- `modules/recording/fastAudioTracks.js` attach direct audio for one external/window stream and mixed audio for multiple streams.
- `modules/recording/realtimeMediaRecorder.js` orchestrate canvas capture, timeslice chunks, repeated start/stop, cleanup.

## New tests
- `tests/021_media_recorder_mime_smoke.mjs`
- `tests/022_fast_audio_tracks_smoke.mjs`

## Verification
- Node syntax checks for all changed and new JS.
- New smoke tests.
- Existing resolution/audio-source smoke tests.
- Read back touched files.
