B"H
# Improvements and Final Plan

## Improvements from first pass
1. Keep custom width/height valid even after preset changes.
2. Make preset selector auto-select Custom when user types dimensions.
3. Redraw immediately after size changes.
4. Update project state before export-plan regeneration.
5. Clamp dimensions to safe minimums and integer pixels.
6. Preserve existing source order and source coordinates.
7. Pass source audio streams into recorder from state.
8. Provide status messages showing whether audio is active or absent.
9. Make audio mixing resilient when no source has audio.
10. Stop audio contexts/processors on recorder stop.
11. Keep each new module under about 120 lines.
12. Do not remove existing streaming/HLS code.
13. Avoid dependencies beyond the existing CDN `webm-muxer` import.
14. Add tests that can run under Node without real WebCodecs devices.
15. Keep browser-only code guarded.
16. Make muxer audio optional so silent recordings still work.
17. Ensure a source with stopped/disabled audio is ignored.
18. Keep the screenshot symptom mapped: WebM has visible video but missing audio.
19. Record known command issue: `commandJobStatus` aliases to `commandStatus`; future calls should use `commandStatus`.
20. Keep final handoff short and evidence-based.

## Actual files to write
- `index.html`
- `main.js`
- `modules/dom.js`
- `modules/recorder.js`
- `modules/webcodecs/webmRecorder.js`
- `modules/recording/sourceAudio.js`
- `modules/recording/audioMix.js`
- `modules/recording/audioEncoder.js`
- `modules/recording/videoFramePump.js`
- `modules/recording/webmMuxerFactory.js`
- `modules/recording/recorderGuards.js`
- `modules/recording/resolutionPresets.js`
- `modules/recording/sizeControls.js`
- `tests/019_resolution_presets_smoke.mjs`
- `tests/020_recording_audio_sources_smoke.mjs`
- `ai-thoughts/20260628-214807-nesher-studio-audio-canvas/*`

## Acceptance
The app should offer preset resolutions plus Custom. Changing a preset or typing custom width/height and applying must update the canvas backing size and visible stage. Recording should mux audio when any source stream has granted audio tracks, while still recording video-only when no source audio exists.
