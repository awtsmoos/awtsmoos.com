B"H
# Second Pass File Map

## Dependency graph
`index.html`
  -> exposes controls
`main.js`
  -> imports DOM, sources, stage, recorder, streamers, NLE
  -> calls `applySize`, `toggleRecording`, `drawStage`
`modules/dom.js`
  -> binds element IDs
`modules/stage.js`
  -> applies canvas backing size and redraws
`modules/recorder.js`
  -> starts/stops `startWebCodecsWebmRecorder`
`modules/webcodecs/webmRecorder.js`
  -> imports `webm-muxer`, encodes VP9 video only today
`modules/sources.js`
  -> captures display audio streams but webcam currently asks `audio:false`

## Concrete submodules to add
- `modules/recording/sourceAudio.js` — discover streams with audio tracks and describe them.
- `modules/recording/audioMix.js` — create an AudioContext mix destination from source streams.
- `modules/recording/audioEncoder.js` — feed mixed audio into AudioEncoder as Opus chunks.
- `modules/recording/videoFramePump.js` — pump canvas frames into VideoEncoder.
- `modules/recording/webmMuxerFactory.js` — build a WebM muxer with video plus optional audio.
- `modules/recording/recorderGuards.js` — WebCodecs feature checks and supported config helpers.
- `modules/recording/resolutionPresets.js` — predefined resolution list and custom parsing.
- `modules/recording/sizeControls.js` — bind preset selector, width/height/fps, and apply behavior.

## Whole-file rewrite rule
Every modified file will be written fully. No partial insertions. New files will be small. Existing `main.js` remains larger than ideal but receives a focused whole-file rewrite; most new logic moves into small modules.

## Verification plan
- Static syntax check for all new/changed JS via `node --check`.
- Node tests for pure resolution preset behavior.
- Node tests for audio-source discovery behavior.
- Existing smoke tests that do not require browser-only globals.
- Read back every touched file after writing.
