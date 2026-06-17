/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state, cfg = s.workerConfig;
    if (!s.renderer || s.isFinalizing) return;
    const latest = s.eventQueue.reduce((max, e) => Math.max(max, e.payload?.time ?? e.payload?.end ?? e.payload?.start ?? 0), s.lastRenderedTime);
    const renderUpToTime = latest - PianoVideo.RENDER_LATENCY_SECONDS;
    if (renderUpToTime <= s.lastRenderedTime) return;
    const dt = 1 / cfg.outputFormat.fps;
    for (let t = s.lastRenderedTime; t < renderUpToTime; t += dt) await s.renderer.addFrame({ time: t, duration: dt });
    s.lastRenderedTime = renderUpToTime;
};
PianoVideo.finalizeMuxing = async function finalizeMuxing(payload) {
    const s = PianoVideo.state, cfg = s.workerConfig;
    s.isFinalizing = true; if (s.processingInterval) clearInterval(s.processingInterval);
    const finalDuration = Math.max(payload.audioBufferShim.duration || 0, s.lastRenderedTime + (1 / cfg.outputFormat.fps));
    const dt = 1 / Math.max(1, cfg.outputFormat.fps || 30); let lastProgress = -1;
    for (let t = s.lastRenderedTime; t < finalDuration; t += dt) { await s.renderer.addFrame({ time: t, duration: dt }); const progress = Math.min(99, Math.floor((t / finalDuration) * 100)); if (progress > lastProgress) { self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: progress } }); lastProgress = progress; } }
    const blob = await s.renderer.finalize(payload.audioBufferShim);
    s.renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
};
