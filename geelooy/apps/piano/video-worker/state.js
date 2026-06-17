/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.state = {
    workerConfig:null, eventQueue:[], renderer:null, lastRenderedTime:0, isFinalizing:false, processingInterval:null,
    masterKeyboardLayout:null, keyCache:{}, particles:[], shockwaves:[], touchPoints:[], lightningBolts:[], baseOffset_Bottom:0, baseOffset_Top:0
};
PianoVideo.resetState = function resetState(config) {
    const s = PianoVideo.state;
    s.workerConfig = config; s.eventQueue = []; s.lastRenderedTime = 0; s.isFinalizing = false;
    s.particles = []; s.shockwaves = []; s.touchPoints = []; s.lightningBolts = [];
    if (s.processingInterval) clearInterval(s.processingInterval);
};
