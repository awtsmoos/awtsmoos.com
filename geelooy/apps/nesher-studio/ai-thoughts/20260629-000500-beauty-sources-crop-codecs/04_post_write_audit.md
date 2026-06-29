B"H
# Post Write Audit — Beauty, Sources, Crop, Manual Encoder Speed

## Research applied
- WebCodecs remains the correct path because it provides low-level control over individual video frames/audio chunks and browser codec implementations.
- VideoEncoder queue pressure is the key control point; the implementation now uses queue caps plus `dequeue` catch-up.
- Hardware acceleration remains requested through `hardwareAcceleration:'prefer-hardware'` in recorder guards.
- Mediabunny remains a future bold path for a tree-shaken muxing/export refactor, but this pass kept the existing manual WebM muxer to avoid a huge library surgery mid-feature.

## Implemented
- Rebuilt the top UI as a richer source toolbar and prettier hero/control surface.
- Added source types:
  - monitor + audio
  - tab/window + audio
  - display video-only
  - display audio-only
  - webcam + mic
  - webcam video-only
  - mic audio-only
  - image file
  - video file
  - audio file
  - browser/iframe/canvas
- Added audio-only visual plates so audio sources have visible layer presence.
- Added crop inspector with L/T/R/B controls and reset.
- Added empty-canvas click deselect behavior.
- Added layer movement: top, up, down, bottom.
- Added safer object URL cleanup for imported media.
- Improved manual encoder profiles to four modes and changed the frame pump to respond to `VideoEncoder` dequeue events.
- Kept `MediaRecorder` forbidden and absent.

## Verification
- `grep -R "MediaRecorder" index.html main.js modules tests` returned none.
- Syntax checks passed for rewritten app modules and tests.
- Existing smoke tests passed: resolution presets, audio-source discovery, aspect ratio, manual audio source.
- Updated manual-profile smoke test passed with 4 profiles.
- New layer/crop smoke test passed.
- HTML ID check passed for the new source/crop/layer controls.

## Remaining runtime checks
- Browser permission flows still need a real Chrome test for display audio-only, mic audio-only, and imported media files.
- Actual encoder speed must be tested on-device by recording the same scene using Speed VP8, Balanced VP8, Balanced VP9, and Quality VP9.
