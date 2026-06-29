B"H
# Final Plan — Manual Only, Faster, Better UI

1. Purge MediaRecorder from app code and tests.
2. Add `manualRecordingProfile.js` for speed/balanced/quality profiles. Default = `speed-vp8`.
3. Add `manualAudioSource.js` to feed single external audio directly into WebCodecs AudioEncoder.
4. Rewrite `recorderGuards.js` so video config supports VP8 and VP9 candidates.
5. Rewrite `videoFramePump.js` to avoid encode backlog and report dropped frames.
6. Rewrite `webmMuxerFactory.js` to dynamically mux V_VP8 or V_VP9 plus Opus.
7. Rewrite `webmRecorder.js` to orchestrate profile + audio source + muxer + frame pump.
8. Rewrite `audioEncoder.js` to use manual source track and cleaner shutdown.
9. Add aspect lock controls, ratio dropdown, and swap button to the sizing UI.
10. Run syntax/smoke checks and grep for forbidden MediaRecorder references.
