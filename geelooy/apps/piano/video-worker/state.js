/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.state = {
    workerConfig: null,
    eventQueue: [],
    renderer: null,
    lastRenderedTime: 0,
    isFinalizing: false,
    processingInterval: null,
    renderPumpActive: false,
    renderPumpTimer: null,
    masterKeyboardLayout: null,
    bottomKeyboardLayout: [],
    topKeyboardLayout: [],
    keyCache: {},
    particles: [],
    shockwaves: [],
    touchPoints: [],
    lightningBolts: [],
    baseOffset_Bottom: 0,
    baseOffset_Top: 0
};
PianoVideo.resetState = function resetState(config) {
    const s = PianoVideo.state;
    s.workerConfig = config;
    s.eventQueue = [];
    s.lastRenderedTime = 0;
    s.isFinalizing = false;
    s.renderPumpActive = false;
    if (s.renderPumpTimer) clearTimeout(s.renderPumpTimer);
    s.renderPumpTimer = null;
    s.bottomKeyboardLayout = [];
    s.topKeyboardLayout = [];
    s.particles = [];
    s.shockwaves = [];
    s.touchPoints = [];
    s.lightningBolts = [];
    if (s.processingInterval) clearInterval(s.processingInterval);
};
