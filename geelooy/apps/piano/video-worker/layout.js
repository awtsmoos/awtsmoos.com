/* B"H */
self.PianoVideo = self.PianoVideo || {};

PianoVideo.calculateMasterLayout = function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map();
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = PianoVideo.MIDI_NOTE_START; midi <= PianoVideo.MIDI_NOTE_END; midi++) {
        const octave = Math.floor(midi / 12) - 1;
        const note = PianoVideo.NOTE_NAMES_SHARP[midi % 12];
        const noteName = note + octave;
        const isBlack = note.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
        if (!isBlack) whiteKeyX += whiteKeyWidth;
    }
    return layout;
};

function clonePanelLayout(panelLayout) {
    return (Array.isArray(panelLayout) ? panelLayout : [])
        .map(key => ({
            note: String(key.note || ''),
            isBlack: !!key.isBlack,
            x: Number(key.x) || 0,
            width: Number(key.width) || 0,
            pressAnimation: 0
        }))
        .filter(key => key.note && key.width > 0);
}

function buildFallbackPanelLayout(startOctave, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let oct = startOctave; oct < startOctave + 8; oct++) {
        PianoVideo.NOTE_NAMES_SHARP.forEach((note, noteIndex) => {
            if (oct + (noteIndex / 12) > 8.5) return;
            const isBlack = note.includes('#');
            const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
            layout.push({ note: `${note}${oct}`, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

PianoVideo.buildRendererLayouts = function buildRendererLayouts() {
    const s = PianoVideo.state;
    const cfg = s.workerConfig;
    const liveLayout = cfg.keyboardLayout || {};
    const startOctave = parseInt(cfg.startOctave, 10) || 0;
    s.bottomKeyboardLayout = clonePanelLayout(liveLayout.bottom);
    s.topKeyboardLayout = clonePanelLayout(liveLayout.top);
    if (!s.bottomKeyboardLayout.length) {
        s.bottomKeyboardLayout = buildFallbackPanelLayout(startOctave, cfg.style.userKeyWidth);
    }
    if ((cfg.alwaysDual || cfg.isVertical) && !s.topKeyboardLayout.length) {
        const topStart = cfg.independentScroll ? startOctave + 4 : startOctave;
        s.topKeyboardLayout = buildFallbackPanelLayout(topStart, cfg.style.userKeyWidth);
    }
};

PianoVideo.setBaseOffsets = function setBaseOffsets() {
    const s = PianoVideo.state;
    const cfg = s.workerConfig;
    s.baseOffset_Bottom = 0;
    s.baseOffset_Top = cfg.independentScroll ? 0 : -cfg.style.userViewportWidth;
};
