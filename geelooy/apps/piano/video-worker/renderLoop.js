/* B"H
Render loop with two paths:
- live preview: tiny throttled frame pump while recording
- final export: full pass at capped fps after Stop
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state, cfg = s.workerConfig;
    if (!s.renderer || s.isFinalizing || s.renderPumpActive) return;
    s.renderPumpActive = true;
    try {
        const fps = Math.max(6, Math.min(cfg.outputFormat.fps || 12, 12));
        const dt = 1 / fps;
        const target = PianoVideo.latestEventTime() - PianoVideo.RENDER_LATENCY_SECONDS;
        let frames = 0;
        const maxFrames = Math.max(0, cfg.liveMaxFramesPerPump || 1);
        while (maxFrames && frames < maxFrames && s.lastRenderedTime + dt <= target) {
            await s.renderer.addFrame({ time: s.lastRenderedTime, duration: dt });
            s.lastRenderedTime += dt;
            frames++;
        }
    } finally {
        s.renderPumpActive = false;
        if (PianoVideo.shouldContinueRealtimePump()) PianoVideo.scheduleRenderPump(80);
    }
};
PianoVideo.latestEventTime = function latestEventTime() {
    const s = PianoVideo.state;
    let max = s.lastRenderedTime;
    for (const event of s.eventQueue) {
        const p = event.payload || {};
        max = Math.max(max, p.time ?? p.end ?? p.start ?? 0);
    }
    return max;
};
PianoVideo.pruneEventQueue = function pruneEventQueue() {
    const s = PianoVideo.state, keep = [];
    let latestScroll = null;
    const keepAfter = Math.max(0, s.lastRenderedTime - .5);
    for (const event of s.eventQueue) {
        const p = event.payload || {}, t = p.time ?? p.end ?? p.start ?? 0;
        if (event.type === 'UPDATE_SCROLL') { latestScroll = event; continue; }
        if (p.end === undefined || p.end >= keepAfter || t >= keepAfter) keep.push(event);
    }
    if (latestScroll) keep.push(latestScroll);
    const limit = s.eventHistoryLimit || 50000;
    s.eventQueue = keep.length > limit ? keep.slice(keep.length - limit) : keep;
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
    const s = PianoVideo.state, cfg = s.workerConfig;
    s.isFinalizing = true;
    if (s.processingInterval) clearInterval(s.processingInterval);
    if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
    const fps = Math.max(8, Math.min(cfg.exportFps || cfg.outputFormat.fps || 18, 18));
    const dt = 1 / fps;
    const finalDuration = Math.max(payload.audioBufferShim.duration || 0, PianoVideo.latestEventTime() + dt);
    const totalFrames = Math.max(1, Math.ceil(finalDuration * fps));
    let lastProgress = -1;
    for (let frame = Math.floor(s.lastRenderedTime * fps); frame < totalFrames; frame++) {
        const t = frame * dt;
        await s.renderer.addFrame({ time: t, duration: dt });
        const progress = Math.min(99, Math.floor((frame / totalFrames) * 100));
        if (progress > lastProgress && progress % 2 === 0) self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: progress } });
        lastProgress = progress;
        if (frame % (cfg.finalFrameBatch || 12) === 0) await Promise.resolve();
    }
    const blob = await s.renderer.finalize(payload.audioBufferShim);
    s.renderer._postComplete(blob, { download: true, fileName: 'BH-WebSynth-Video-' + Date.now() + '.mp4' });
};
