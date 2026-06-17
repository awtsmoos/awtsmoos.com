/* B"H
One clock only. The live recorder and final exporter walk the same frame grid,
so no choppy mixed-cadence vessel is born.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state, cfg = s.workerConfig;
    if (!s.renderer || s.isFinalizing || s.renderPumpActive) return;
    s.renderPumpActive = true;
    try {
        const fps = PianoVideo.outputFps();
        const dt = 1 / fps;
        const target = PianoVideo.latestEventTime() - PianoVideo.RENDER_LATENCY_SECONDS;
        const maxFrames = Math.max(0, cfg.liveMaxFramesPerPump || 1);
        let frames = 0;
        while (frames < maxFrames && s.lastRenderedTime + dt <= target) {
            await s.renderer.addFrame({ time: s.lastRenderedTime, duration: dt });
            s.lastRenderedTime = PianoVideo.roundTime(s.lastRenderedTime + dt);
            frames++;
        }
    } finally {
        s.renderPumpActive = false;
        if (PianoVideo.shouldContinueRealtimePump()) PianoVideo.scheduleRenderPump(90);
    }
};
PianoVideo.outputFps = function outputFps() {
    const cfg = PianoVideo.state.workerConfig || {};
    return Math.max(8, Math.min(cfg.exportFps || cfg.outputFormat?.fps || 18, 18));
};
PianoVideo.roundTime = function roundTime(t) { return Math.round(t * 1000000) / 1000000; };
PianoVideo.latestEventTime = function latestEventTime() {
    const s = PianoVideo.state;
    let max = s.lastRenderedTime;
    for (const event of s.eventQueue) {
        const p = event.payload || {};
        max = Math.max(max, p.time ?? p.end ?? p.start ?? 0);
    }
    return max;
};
PianoVideo.shouldContinueRealtimePump = function shouldContinueRealtimePump() {
    const s = PianoVideo.state;
    if (s.isFinalizing) return false;
    return PianoVideo.latestEventTime() - PianoVideo.RENDER_LATENCY_SECONDS > s.lastRenderedTime + .01;
};
PianoVideo.scheduleRenderPump = function scheduleRenderPump(delay = 0) {
    const s = PianoVideo.state;
    if (s.renderPumpTimer || s.isFinalizing) return;
    s.renderPumpTimer = setTimeout(() => { s.renderPumpTimer = null; PianoVideo.processEventQueue(); }, delay);
};
PianoVideo.finalizeMuxing = async function finalizeMuxing(payload) {
    const s = PianoVideo.state;
    s.isFinalizing = true;
    if (s.processingInterval) clearInterval(s.processingInterval);
    if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
    const fps = PianoVideo.outputFps();
    const dt = 1 / fps;
    const finalDuration = Math.max(payload.audioBufferShim.duration || 0, PianoVideo.latestEventTime() + dt);
    let t = s.lastRenderedTime;
    let lastProgress = -1;
    while (t < finalDuration - .0005) {
        await s.renderer.addFrame({ time: t, duration: dt });
        t = PianoVideo.roundTime(t + dt);
        s.lastRenderedTime = t;
        const progress = Math.min(99, Math.floor((t / finalDuration) * 100));
        if (progress > lastProgress && progress % 2 === 0) self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: progress } });
        lastProgress = progress;
        if (Math.round(t * fps) % 12 === 0) await Promise.resolve();
    }
    const blob = await s.renderer.finalize(payload.audioBufferShim);
    s.renderer._postComplete(blob, { download: true, fileName: 'BH-WebSynth-Video-' + Date.now() + '.mp4' });
};
