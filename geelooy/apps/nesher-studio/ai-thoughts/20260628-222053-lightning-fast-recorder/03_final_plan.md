B"H
# Final Plan — Lightning Recorder

1. Add engine selector with default `fast`.
2. Implement MediaRecorder MIME choosing and use VP9/VP8/Opus where supported.
3. Assemble the output MediaStream from canvas video plus source audio.
4. Prefer direct cloned audio track for a single external/window source to avoid garbled WebCodecs audio transcode.
5. Use audio mixer only when more than one source stream must be blended.
6. Start MediaRecorder with a 500ms timeslice so blobs are produced during recording.
7. Stop and clean every capture-stream track and cloned audio track so the next recording starts cleanly.
8. Make downloads persistent in a shelf, with auto-click still attempted.
9. Preserve WebCodecs as optional quality mode.
10. Verify with static and smoke tests.
