B"H
# Manual WebCodecs Speed + Aspect Brainstorm

## Fresh command
The user explicitly rejects MediaRecorder in any form. Recording must be manual WebCodecs, but much faster. UI resizing must keep aspect ratio by default, with an unlock setting.

## Observed regressions to remove
- `modules/recording/realtimeMediaRecorder.js` uses MediaRecorder and must be removed from active code.
- `modules/recording/mediaRecorderMime.js` exists only for MediaRecorder and must be deleted.
- `modules/recording/fastAudioTracks.js` was built for output stream attachment and should be replaced with a manual WebCodecs audio-source selector.
- `modules/recorder.js` currently chooses between realtime MediaRecorder and WebCodecs; it must choose only manual WebCodecs profiles.

## Speed strategy without MediaRecorder
1. Default to VP8 WebCodecs speed profile instead of VP9 quality profile.
2. Keep VP9 balanced/quality selectable for when the user wants it.
3. Use `latencyMode:'realtime'`, `hardwareAcceleration:'prefer-hardware'`, lower keyframe interval, and encoder queue backpressure.
4. Drop video frames when encode queue is full instead of blocking the UI and making finalization slow.
5. Use manual muxer plus WebCodecs only; no MediaRecorder, no canvas captureStream recording.
6. For audio, direct single external/window track into AudioEncoder via MediaStreamTrackProcessor; avoid AudioContext mixing unless there are multiple audio sources.
7. Increase Opus bitrate and use real track settings for channel/sample rate when available.

## Resizing strategy
- Add aspect lock checkbox enabled by default.
- Add aspect ratio dropdown: 16:9 default, 9:16, 1:1, 4:3, 21:9, Custom/current.
- Width edits update height while locked; height edits update width while locked.
- Presets sync the ratio.
- Add Swap W/H button.

## Files to touch
- `index.html`, `style.css`, `modules/dom.js`, `modules/recorder.js`.
- `modules/recording/sizeControls.js`, plus new `aspectRatio.js` and `manualRecordingProfile.js`.
- `modules/recording/manualAudioSource.js`, rewrite `audioEncoder.js`, `audioMix.js`, `recorderGuards.js`, `videoFramePump.js`, `webmMuxerFactory.js`, `webmRecorder.js`.
- Delete MediaRecorder modules/tests.
