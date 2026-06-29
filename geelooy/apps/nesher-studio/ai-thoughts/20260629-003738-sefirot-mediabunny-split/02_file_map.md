B"H
# File Map

New small modules:
- `modules/sefiros/names.js`
- `modules/sefiros/recordingTree.js`
- `modules/mediabunny/loader.js`
- `modules/mediabunny/guards.js`
- `modules/mediabunny/hlsOutput.js`
- `modules/mediabunny/hlsState.js`
- `modules/mediabunny/hlsCapture.js`
- `modules/mediabunny/hlsPump.js`
- `modules/mediabunny/hlsStop.js`
- `modules/mediabunny/url.js`
- `modules/recording/container/webmMuxerUrl.js`
- `modules/recording/container/webmTrackConfig.js`
- `modules/recording/container/webmTarget.js`
- `modules/recording/container/webmBlob.js`
- `modules/recording/container/webmCodecString.js`
- `modules/recording/container/legacyWebmMuxer.js`

Whole rewrites:
- `modules/webcodecs/hlsTsStreamer.js` keep `startHlsTsStream` public API.
- `modules/recording/webmMuxerFactory.js` keep `createWebmMuxer`, `finalizeWebmTarget`, `codecString` public API.

Tests:
- `tests/025_sefiros_and_container_smoke.mjs`
- `tests/026_mediabunny_hls_split_smoke.mjs`
