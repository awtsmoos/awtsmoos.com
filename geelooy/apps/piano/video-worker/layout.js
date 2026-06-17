/* B"H */
self.PianoVideo = self.PianoVideo || {};
PianoVideo.calculateMasterLayout = function calculateMasterLayout(whiteKeyWidth) {
    const layout = new Map(); let whiteKeyX = 0; const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let midi = PianoVideo.MIDI_NOTE_START; midi <= PianoVideo.MIDI_NOTE_END; midi++) {
        const octave = Math.floor(midi / 12) - 1, note = PianoVideo.NOTE_NAMES_SHARP[midi % 12], noteName = note + octave, isBlack = note.includes('#');
        const x = isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX;
        layout.set(noteName, { note: noteName, isBlack, x, width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0 });
        if (!isBlack) whiteKeyX += whiteKeyWidth;
    }
    return layout;
};
PianoVideo.setBaseOffsets = function setBaseOffsets() {
    const s = PianoVideo.state, cfg = s.workerConfig, uiStartOctave = parseInt(cfg.startOctave);
    s.baseOffset_Bottom = s.masterKeyboardLayout.get(`C${uiStartOctave}`)?.x || 0;
    s.baseOffset_Top = cfg.independentScroll ? (s.masterKeyboardLayout.get(`C${uiStartOctave + 4}`)?.x || 0) : s.baseOffset_Bottom - cfg.style.userViewportWidth;
};
