B"H
# Final Plan

Implement a practical pass:
1. Keep manual WebCodecs only.
2. Improve encoder pump with `dequeue` scheduling and richer profiles.
3. Add top/bottom layer order commands.
4. Add empty-canvas click deselect.
5. Add source adders: webcam both/video-only, mic audio-only, display both/video-only/audio-only, image, video, audio.
6. Render audio-only sources as beautiful plates.
7. Add crop inspector with left/top/right/bottom numeric controls and reset.
8. Make the UI more beautiful and easier to use.
9. Verify syntax, smoke tests, no forbidden MediaRecorder references.
