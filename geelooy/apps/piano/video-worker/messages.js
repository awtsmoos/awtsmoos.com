/* B"H
Live encoding interval: starts only after MediaBunnyBase.isStarted is true.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.initializeRenderer = async function initializeRenderer(payload) {
    const s = PianoVideo.state;
    PianoVideo.resetState(payload);
    s.eventHistoryLimit = payload.eventHistoryLimit || 120000;
    s.renderer = new MediaBunnyBase(payload, PianoVideo.drawKeyboardFrame, { libraryPath:'/scripts/awtsmoos/video/mediabunny-library.js' });
    await s.renderer.start();
    s.masterKeyboardLayout = PianoVideo.calculateMasterLayout(payload.style.userKeyWidth);
    PianoVideo.buildRendererLayouts();
    const zoom = payload.resolution.width / payload.style.userViewportWidth;
    const rows = (payload.alwaysDual || payload.isVertical) ? 2 : 1;
    const rowH = (payload.resolution.height / zoom) / rows;
    PianoVideo.cacheKeyRenders(payload.style.userKeyWidth, rowH * .95);
    PianoVideo.setBaseOffsets();
    if (s.renderer.isStarted) s.processingInterval = setInterval(() => PianoVideo.scheduleRenderPump(0), payload.livePumpIntervalMs || 160);
    self.postMessage({ type:'STATUS_UPDATE', payload:{ message:'Live encoding ordered frames. No skips.' } });
};
PianoVideo.handleRenderEvent = function handleRenderEvent(type, payload) {
    if (payload.start !== undefined || type === 'KEY_DOWN') payload.effectTriggered = false;
    PianoVideo.queueRenderEvent({ type, payload });
};
PianoVideo.queueRenderEvent = function queueRenderEvent(event) {
    const s = PianoVideo.state;
    s.eventQueue.push(event);
    const over = s.eventQueue.length - (s.eventHistoryLimit || 120000);
    if (over > 0) s.eventQueue.splice(0, over);
};
self.onmessage = async e => {
    const { type, payload } = e.data;
    try {
        if (PianoVideo.state.isFinalizing && type !== 'FINALIZE_MUXING') return;
        if (type === 'INITIALIZE_RENDERER') await PianoVideo.initializeRenderer(payload);
        else if (type === 'KEY_DOWN' || type === 'ADD_KEY_EVENT' || type === 'UPDATE_SCROLL') PianoVideo.handleRenderEvent(type, payload);
        else if (type === 'FINALIZE_MUXING') await PianoVideo.finalizeMuxing(payload);
    } catch (error) {
        self.postMessage({ type:'FATAL_ERROR', payload:{ message:'Video worker failed: ' + (error?.message || error) } });
    }
};
