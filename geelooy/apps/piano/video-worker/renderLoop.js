/* B"H
Live encoder, no skips: every frame is encoded in order.
The Awtsmoos lets the river lag rather than tear holes in time.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.processEventQueue = async function processEventQueue() {
    const s = PianoVideo.state, cfg = s.workerConfig || {};
    if (!s.renderer || !s.renderer.isStarted || s.isFinalizing || s.renderPumpActive) return;
    s.renderPumpActive = true;
    try {
        const fps = PianoVideo.outputFps();
        const dt = 1 / fps;
        const target = Math.max(0, PianoVideo.latestEventTime() - (cfg.liveEncodeLatency || .42));
        const maxFrames = Math.max(1, cfg.liveCatchupFrames || 2);
        let frames = 0;
        while (frames < maxFrames && s.lastRenderedTime + dt <= target) {
            await PianoVideo.safeAddFrame(s.lastRenderedTime, dt, 'live');
            s.lastRenderedTime = PianoVideo.roundTime(s.lastRenderedTime + dt);
            s.encodedLiveFrames = (s.encodedLiveFrames || 0) + 1;
            frames++;
        }
        if ((s.encodedLiveFrames || 0) && s.encodedLiveFrames % 30 === 0) {
            const lag = Math.max(0, target - s.lastRenderedTime).toFixed(2);
            self.postMessage({ type:'STATUS_UPDATE', payload:{ message:'Live encoding ordered frames. Lag: ' + lag + 's' } });
        }
    } catch (error) {
        PianoVideo.noteRenderError(error, 'Live frame delayed');
    } finally {
        s.renderPumpActive = false;
    }
};
PianoVideo.safeAddFrame = async function safeAddFrame(time, duration, phase) {
    const s = PianoVideo.state;
    if (!s.renderer || !s.renderer.isStarted) throw new Error('Renderer not ready during ' + phase);
    await s.renderer.addFrame({ time, duration });
};
PianoVideo.noteRenderError = function noteRenderError(error, prefix) {
    const s = PianoVideo.state;
    s.renderErrorCount = (s.renderErrorCount || 0) + 1;
    if (s.renderErrorCount <= 4) self.postMessage({ type:'STATUS_UPDATE', payload:{ message:prefix + ': ' + (error?.message || error) } });
    if (s.renderErrorCount > 16) self.postMessage({ type:'FATAL_ERROR', payload:{ message:'Video render failed: ' + (error?.message || error) } });
};
PianoVideo.outputFps = function outputFps() {
    const cfg = PianoVideo.state.workerConfig || {};
    return Math.max(8, Math.min(cfg.exportFps || cfg.outputFormat?.fps || 15, 18));
};
PianoVideo.roundTime = t => Math.round(t * 1000000) / 1000000;
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
    if (s.renderPumpTimer || s.isFinalizing || !s.renderer?.isStarted) return;
    s.renderPumpTimer = setTimeout(() => { s.renderPumpTimer = null; PianoVideo.processEventQueue(); }, delay);
};
PianoVideo.shouldContinueRealtimePump = () => false;
PianoVideo.finalizeMuxing = async function finalizeMuxing(payload) {
    const s = PianoVideo.state, cfg = s.workerConfig || {};
    try {
        s.isFinalizing = true;
        if (s.processingInterval) clearInterval(s.processingInterval);
        if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
        if (!s.renderer?.isStarted) await s.renderer?.start?.();
        const fps = PianoVideo.outputFps();
        const dt = 1 / fps;
        const finalDuration = Math.max(payload.audioBufferShim.duration || 0, PianoVideo.latestEventTime() + dt);
        let t = PianoVideo.roundTime(s.lastRenderedTime || 0);
        let frame = Math.round(t * fps);
        let lastProgress = -1;
        while (t < finalDuration - .0005) {
            await PianoVideo.safeAddFrame(t, dt, 'final');
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
    } catch (error) {
        self.postMessage({ type:'FATAL_ERROR', payload:{ message:'Video render failed: ' + (error?.message || error) } });
    }
};
