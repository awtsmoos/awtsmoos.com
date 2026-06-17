/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.initializeRenderer = async function initializeRenderer(payload) {
    const s = PianoVideo.state; PianoVideo.resetState(payload);
    s.renderer = new MediaBunnyBase(payload, PianoVideo.drawKeyboardFrame, { libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' });
    await s.renderer.start(); s.masterKeyboardLayout = PianoVideo.calculateMasterLayout(payload.style.userKeyWidth);
    const zoom = payload.resolution.width / payload.style.userViewportWidth;
    const rowH = (payload.resolution.height / zoom) / ((payload.alwaysDual || payload.isVertical) ? 2 : 1);
    PianoVideo.cacheKeyRenders(payload.style.userKeyWidth, rowH * .95); PianoVideo.setBaseOffsets();
    s.processingInterval = setInterval(PianoVideo.processEventQueue, 500);
};
PianoVideo.handleRenderEvent = function handleRenderEvent(type, payload) {
    if (payload.start !== undefined || type === 'KEY_DOWN') payload.effectTriggered = false;
    PianoVideo.state.eventQueue.push({ type, payload }); PianoVideo.processEventQueue();
};
self.onmessage = async e => {
    const { type, payload } = e.data;
    if (PianoVideo.state.isFinalizing && type !== 'FINALIZE_MUXING') return;
    if (type === 'INITIALIZE_RENDERER') await PianoVideo.initializeRenderer(payload);
    else if (type === 'KEY_DOWN' || type === 'ADD_KEY_EVENT' || type === 'UPDATE_SCROLL') PianoVideo.handleRenderEvent(type, payload);
    else if (type === 'FINALIZE_MUXING') await PianoVideo.finalizeMuxing(payload);
};
