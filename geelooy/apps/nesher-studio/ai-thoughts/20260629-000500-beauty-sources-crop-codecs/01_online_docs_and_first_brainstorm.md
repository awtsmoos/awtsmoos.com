B"H
# Online Docs + First Brainstorm

The user wants beauty, faster manual WebCodecs encoding without MediaRecorder, richer source additions, deselect-on-empty-click, crop controls, and top/bottom layer movement.

Docs inspected:
- MDN WebCodecs: WebCodecs gives low-level efficient encode/decode control and is available in dedicated workers.
- MDN VideoEncoder: supports `isConfigSupported`, configure, encode queue state, and queue-driven operation.
- MDN encodeQueueSize: pending encode requests can be observed to regulate frame pressure.
- Mediabunny docs: hardware-accelerated encoding via WebCodecs, broad source/container support, and source abstractions.

Brainstorm:
1. Manual encoder quality-speed improvement should not reintroduce browser recorders.
2. Add profile logic that prefers H.264/AVC when WebM muxing is not required? But current recorder muxes WebM; H.264 in WebM is risky. Keep VP8/VP9 WebM for local recording, but expose better queue target, bitrate quality, and SVC temporal layers if supported.
3. Introduce VideoEncoder `dequeue` listener so the pump can resume faster when the queue drains instead of only interval pumping.
4. Use content-hint-like settings? Not on WebCodecs frames directly; use profile metadata.
5. Source UI should separate source modes: display with audio, display video-only, display audio-only, webcam both, webcam video-only, mic audio-only, image file, video file, audio file.
6. Audio-only nodes should appear in source list and record, but render as a plate/meters instead of a blank broken image.
7. Crop should be simple: numeric left/top/right/bottom percent or pixels; start with percent because UI is compact.
8. Selected source panel should expose crop sliders and layer buttons.
9. Click empty canvas should deselect.
10. Layer actions: top, bottom, up, down.
