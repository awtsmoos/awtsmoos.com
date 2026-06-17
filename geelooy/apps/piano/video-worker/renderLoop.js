/* B"H
Live encoder with mercy: encode during the performance, but never chase the past.
If the encoder falls behind, it advances to the newest safe frame and the musician lives.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state, cfg = s.workerConfig;
    if (!s.renderer || s.isFinalizing || s.renderPumpActive) return;
    s.renderPumpActive = true;
    try {
        const fps = PianoVideo.outputFps();
        const dt = 1 / fps;
        const latest = PianoVideo.latestEventTime();
        const target = Math.max(0, latest - (cfg.liveEncodeLatency || .45));
        const backlog = target - s.lastRenderedTime;
        if (backlog < dt * .75) return;
        if (backlog > (cfg.maxLiveBacklog || 1.25)) s.lastRenderedTime = PianoVideo.snapFrameTime(target - dt, fps);
        await s.renderer.addFrame({ time: s.lastRenderedTime, duration: dt });
        s.lastRenderedTime = PianoVideo.roundTime(s.lastRenderedTime + dt);
        s.encodedLiveFrames = (s.encodedLiveFrames || 0) + 1;
        if (s.encodedLiveFrames % 24 === 0) self.postMessage({ type:'STATUS_UPDATE', payload:{ message:'Live encoding with backpressure: ' + s.encodedLiveFrames + ' frames.' } });
    } finally {
        s.renderPumpActive = false;
    }
};
PianoVideo.outputFps = function outputFps() {
    const cfg = PianoVideo.state.workerConfig || {};
    return Math.max(8, Math.min(cfg.exportFps || cfg.outputFormat?.fps || 15, 18));
};
PianoVideo.roundTime = t => Math.round(t * 1000000) / 1000000;
PianoVideo.snapFrameTime = (t, fps) => PianoVideo.roundTime(Math.max(0, Math.floor(t * fps) / fps));
PianoVideo.latestEventTime = function latestEventTime() {
    let max = 0;
    for (const event of PianoVideo.state.eventQueue) {
        const p = event.payload || {};
        max = Math.max(max, p.time ?? p.end ?? p.start ?? 0);
    }
    return max;
};
PianoVideo.scheduleRenderPump = function scheduleRenderPump(delay = 0) {
    const s = PianoVideo.state;
    if (s.renderPumpTimer || s.isFinalizing) return;
    s.renderPumpTimer = setTimeout(() => { s.renderPumpTimer = null; PianoVideo.processEventQueue(); }, delay);
};
PianoVideo.shouldContinueRealtimePump = function shouldContinueRealtimePump() { return false; };
PianoVideo.finalizeMuxing = async function finalizeMuxing(payload) {
    const s = PianoVideo.state, cfg = s.workerConfig;
    s.isFinalizing = true;
    if (s.processingInterval) clearInterval(s.processingInterval);
    if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
    const fps = PianoVideo.outputFps();
    const dt = 1 / fps;
    const finalDuration = Math.max(payload.audioBufferShim.duration || 0, PianoVideo.latestEventTime() + dt);
    let t = PianoVideo.snapFrameTime(s.lastRenderedTime || 0, fps);
    let frame = Math.round(t * fps);
    let lastProgress = -1;
    while (t < finalDuration - .0005) {
        await s.renderer.addFrame({ time: t, duration: dt });
        frame++;
        t = PianoVideo.roundTime(frame * dt);
        s.lastRenderedTime = t;
        const progress = Math.min(99, Math.floor((t / finalDuration) * 100));
        if (progress > lastProgress && progress % 2 === 0) self.postMessage({ type:'PROGRESS_UPDATE', payload:{ percent: progress } });
        lastProgress = progress;
        if (frame % (cfg.finalFrameBatch || 8) === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const blob = await s.renderer.finalize(payload.audioBufferShim);
    s.renderer._postComplete(blob, { download:true, fileName:'BH-WebSynth-Video-' + Date.now() + '.mp4' });
};
