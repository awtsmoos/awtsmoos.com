/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state;
    const cfg = s.workerConfig;
    if (!s.renderer || s.isFinalizing || s.renderPumpActive) return;
    s.renderPumpActive = true;
    try {
        const fps = Math.max(1, cfg.outputFormat.fps || 30);
        const dt = 1 / fps;
        const budgetMs = cfg.liveRenderBudgetMs || 14;
        const maxFrames = cfg.liveMaxFramesPerPump || 3;
        const started = performance.now();
        let frames = 0;
        while (frames < maxFrames && performance.now() - started < budgetMs) {
            const latest = PianoVideo.latestEventTime();
            const renderUpToTime = latest - PianoVideo.RENDER_LATENCY_SECONDS;
            if (renderUpToTime <= s.lastRenderedTime + 0.0005) break;
            await s.renderer.addFrame({ time: s.lastRenderedTime, duration: dt });
            s.lastRenderedTime += dt;
            frames++;
        }
    } finally {
        s.renderPumpActive = false;
        if (PianoVideo.shouldContinueRealtimePump()) PianoVideo.scheduleRenderPump(16);
    }
};

PianoVideo.latestEventTime = function latestEventTime() {
    const s = PianoVideo.state;
    return s.eventQueue.reduce((max, e) => {
        const p = e.payload || {};
        return Math.max(max, p.time ?? p.end ?? p.start ?? 0);
    }, s.lastRenderedTime);
};

PianoVideo.shouldContinueRealtimePump = function shouldContinueRealtimePump() {
    if (PianoVideo.state.isFinalizing) return false;
    return PianoVideo.latestEventTime() - PianoVideo.RENDER_LATENCY_SECONDS > PianoVideo.state.lastRenderedTime;
};

PianoVideo.scheduleRenderPump = function scheduleRenderPump(delay = 0) {
    const s = PianoVideo.state;
    if (s.renderPumpTimer || s.isFinalizing) return;
    s.renderPumpTimer = setTimeout(() => {
        s.renderPumpTimer = null;
        PianoVideo.processEventQueue();
    }, delay);
};

PianoVideo.finalizeMuxing = async function finalizeMuxing(payload) {
    const s = PianoVideo.state, cfg = s.workerConfig;
    s.isFinalizing = true;
    if (s.processingInterval) clearInterval(s.processingInterval);
    if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
    const finalDuration = Math.max(payload.audioBufferShim.duration || 0, s.lastRenderedTime + (1 / cfg.outputFormat.fps));
    const dt = 1 / Math.max(1, cfg.outputFormat.fps || 30);
    let lastProgress = -1;
    for (let t = s.lastRenderedTime; t < finalDuration; t += dt) {
        await s.renderer.addFrame({ time: t, duration: dt });
        const progress = Math.min(99, Math.floor((t / finalDuration) * 100));
        if (progress > lastProgress) self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: progress } });
        lastProgress = progress;
    }
    const blob = await s.renderer.finalize(payload.audioBufferShim);
    s.renderer._postComplete(blob, { download: true, fileName: `BH-WebSynth-Video-${Date.now()}.mp4` });
};
