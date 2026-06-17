/* B"H
The live worker may breathe, but it must not swallow the musician.
Old events are trimmed; final rendering still receives the whole song shape through surviving key spans.
*/
self.PianoVideo = self.PianoVideo || {};
PianoVideo.initializeRenderer = async function initializeRenderer(payload) {
    const s = PianoVideo.state;
    PianoVideo.resetState(payload);
    s.eventHistoryLimit = payload.eventHistoryLimit || 700;
    s.renderer = new MediaBunnyBase(payload, PianoVideo.drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
    await s.renderer.start();
    s.masterKeyboardLayout = PianoVideo.calculateMasterLayout(payload.style.userKeyWidth);
    PianoVideo.buildRendererLayouts();
    const zoom = payload.resolution.width / payload.style.userViewportWidth;
    const rows = (payload.alwaysDual || payload.isVertical) ? 2 : 1;
    const rowH = (payload.resolution.height / zoom) / rows;
    PianoVideo.cacheKeyRenders(payload.style.userKeyWidth, rowH * .95);
    PianoVideo.setBaseOffsets();
    s.processingInterval = setInterval(() => PianoVideo.scheduleRenderPump(0), payload.livePumpIntervalMs || 180);
    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Realtime preview armed; final render waits for Stop.' } });
};
PianoVideo.handleRenderEvent = function handleRenderEvent(type, payload) {
    if (payload.start !== undefined || type === 'KEY_DOWN') payload.effectTriggered = false;
    PianoVideo.queueRenderEvent({ type, payload });
    if (type !== 'UPDATE_SCROLL') PianoVideo.scheduleRenderPump(0);
};
PianoVideo.queueRenderEvent = function queueRenderEvent(event) {
    const s = PianoVideo.state;
    s.eventQueue.push(event);
    PianoVideo.pruneEventQueue();
};
self.onmessage = async e => {
    const { type, payload } = e.data;
    if (PianoVideo.state.isFinalizing && type !== 'FINALIZE_MUXING') return;
    if (type === 'INITIALIZE_RENDERER') await PianoVideo.initializeRenderer(payload);
    else if (type === 'KEY_DOWN' || type === 'ADD_KEY_EVENT' || type === 'UPDATE_SCROLL') PianoVideo.handleRenderEvent(type, payload);
    else if (type === 'FINALIZE_MUXING') await PianoVideo.finalizeMuxing(payload);
};
