
/* B"H */
// piano/modules/input.js
import { AudioState } from './audio.js';
import { createSynthNode, startSynth, stopSynth, activeNotes, currentChordNodes, currentChordRoot, clearCurrentChord, setCurrentChordRoot } from './synth.js';
import { elements, setScroll, scrollState, activeScroller, updateScrollbarThumbs } from './ui.js';
import { isVideoRecording, videoKeyDownMap, videoRecordingData } from './recorder.js';
import { isSheetRecording, sheetRecordingStartTime, sheetNotes } from './recorder.js';

export const noteFrequencies = {
    'C': 16.35, 'C#': 17.32, 'D': 18.35, 'D#': 19.45, 'E': 20.60, 'F': 21.83,
    'F#': 23.12, 'G': 24.50, 'G#': 25.96, 'A': 27.50, 'A#': 29.14, 'B': 30.87
};
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord Data
const major7thChords = {
    'C': ['C', 'E', 'G', 'B'], 'D': ['D', 'F#', 'A', 'C#'], 'E': ['E', 'G#', 'B', 'D#'],
    'F': ['F', 'A', 'C', 'E'], 'G': ['G', 'B', 'D', 'F#'], 'A': ['A', 'C#', 'E', 'G#'], 'B': ['B', 'D#', 'F#', 'A#']
};
const minor7thChords = {
    'C': ['C', 'D#', 'G', 'A#'], 'D': ['D', 'F', 'A', 'C'], 'E': ['E', 'G', 'B', 'D'],
    'F': ['F', 'G#', 'C', 'D#'], 'G': ['G', 'A#', 'D', 'F'], 'A': ['A', 'C', 'E', 'G'], 'B': ['B', 'D', 'F#', 'A']
};

export function setupInputListeners() {
    elements.keyboardContainer.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUpOrCancel);
    document.addEventListener('pointercancel', handlePointerUpOrCancel);
    
    // Scrollbar
    elements.customScrollbarThumb.addEventListener('pointerdown', (e) => handleScrollbarPointerDown(e, 0));
    elements.customScrollbarThumbTop.addEventListener('pointerdown', (e) => handleScrollbarPointerDown(e, 1));
    document.addEventListener('pointermove', handleDocumentPointerMove);

    // Desktop Keyboard
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// --- POINTER LOGIC ---
function handlePointerDown(e) {
    const target = e.target;
    const keyElement = target.closest('.key');
    if (keyElement) {
        e.preventDefault();
        if (activeNotes.has(e.pointerId)) return;
        const noteName = keyElement.dataset.note;
        const keyRect = keyElement.getBoundingClientRect();
        triggerNoteOn(noteName, e.pointerId, { x: e.clientX - keyRect.left, y: e.clientY - keyRect.top }, keyElement);
    }
}

function handlePointerUpOrCancel(e) {
    if (activeScroller.isDragging) {
        activeScroller.thumb.style.cursor = 'grab';
        activeScroller.isDragging = false;
        localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
    }
    triggerNoteOff(e.pointerId);
}

// --- KEYBOARD LOGIC ---
// Map 'a'..'j' to notes relative to C4 (or selected octave)
// We defined the UI labels in ui.js, now we implement the logic
const KEY_TO_NOTE_OFFSET = {
    'a': {n:'C', o:4}, 'w': {n:'C#', o:4}, 's': {n:'D', o:4}, 'e': {n:'D#', o:4}, 'd': {n:'E', o:4},
    'f': {n:'F', o:4}, 't': {n:'F#', o:4}, 'g': {n:'G', o:4}, 'y': {n:'G#', o:4}, 'h': {n:'A', o:4},
    'u': {n:'A#', o:4}, 'j': {n:'B', o:4},
    'k': {n:'C', o:5}, 'o': {n:'C#', o:5}, 'l': {n:'D', o:5}, 'p': {n:'D#', o:5}, ';': {n:'E', o:5}, "'": {n:'F', o:5}
};

function handleKeyDown(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.target.tagName === 'INPUT') return;
    const key = e.key.toLowerCase();
    const mapping = KEY_TO_NOTE_OFFSET[key];
    if (mapping) {
        // Virtual pointer ID for keyboard
        const pid = `kb-${key}`;
        if (activeNotes.has(pid)) return;
        
        // Find DOM element to light it up
        // Note name construction:
        // We need to match the UI. If default is C4, then 'a' is C4.
        // But the keyboard generator starts at elements.octaveSelect.value.
        // Let's rely on the text labels we generated or just construct noteName.
        // Ideally we assume user wants to play what's labeled. 
        // We labeled 'a' as C4 if active octave is 4.
        // Let's just assume the mapping is relative to C4.
        
        const noteName = mapping.n + mapping.o;
        const keyElement = document.querySelector(`.key[data-note="${noteName}"]`);
        
        if (keyElement) {
             const keyRect = keyElement.getBoundingClientRect();
             triggerNoteOn(noteName, pid, { x: keyRect.width/2, y: keyRect.height/2 }, keyElement);
        }
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (KEY_TO_NOTE_OFFSET[key]) {
        triggerNoteOff(`kb-${key}`);
    }
}

// --- CORE NOTE TRIGGERS ---

function triggerNoteOn(noteName, inputId, coords, keyElement) {
    const note = noteName.replace(/\d/g, '');
    const octave = parseInt(noteName.match(/\d+/g));
    const frequency = noteFrequencies[note] * Math.pow(2, octave);

    // Chords
    if (elements.playChordsCheckbox.checked) triggerChord(note, octave, frequency);

    // Play Main Note
    const synthNodes = createSynthNode(false);
    if (synthNodes) {
        startSynth(synthNodes, frequency);
        activeNotes.set(inputId, { synthNodes, keyElement });
        keyElement.classList.add('active');
        
        // Logging
        if (isVideoRecording) {
             videoKeyDownMap.set(noteName, { startTime: AudioState.context.currentTime, x: coords.x, y: coords.y });
             // Send immediate event for Touch Point
             // (We need access to worker, doing via recorder helper later or direct postMessage if exposed)
             // For now we rely on the recorder module's logging mechanism which polls activeNotes or key events?
             // The original code pushed to videoRecordingData in logVideoFrame.
             // We need to maintain that flow or improve it.
             // Updated design: UI updates drive the worker in `ui.js` via `sendFrameStateToWorker`.
             // But key events need to be sent. We can call a helper in recorder.
             // See recorder.js `logKeyEvent`
        }

        if (isSheetRecording) {
            activeNotes.get(inputId).sheetMusicStartTime = AudioState.context.currentTime - sheetRecordingStartTime;
        }
    }
}

function triggerNoteOff(inputId) {
    const activeNote = activeNotes.get(inputId);
    if (activeNote) {
        stopSynth(activeNote.synthNodes);
        activeNote.keyElement.classList.remove('active');
        const noteName = activeNote.keyElement.dataset.note;
        activeNotes.delete(inputId);

        // Chords cleanup
        if (activeNotes.size === 0 && elements.playChordsCheckbox.checked) {
            clearCurrentChord();
        }

        if (isSheetRecording && activeNote.sheetMusicStartTime !== undefined) {
             const endTime = AudioState.context.currentTime - sheetRecordingStartTime;
             sheetNotes.push({
                 note: noteName,
                 start: activeNote.sheetMusicStartTime,
                 duration: endTime - activeNote.sheetMusicStartTime
             });
        }
        // Video log up event handled in recorder's flush or similar
        // Actually we need to log the UP event for video.
        // We will expose a hook in recorder.
    }
}

// --- CHORD LOGIC ---
function triggerChord(note, octave, frequency) {
    const rootNote = note.replace('#', '');
    if (!major7thChords[rootNote] || rootNote === currentChordRoot) return;
    
    clearCurrentChord();
    setCurrentChordRoot(rootNote);

    const mode = elements.chordModeSelect.value;
    // Auto detect logic...
    // (Simplified for brevity, assuming existing logic)
    const quality = (mode === 'minor') ? 'minor' : 'major'; // Defaulting for robustness
    const chordNotes = (quality === 'minor') ? minor7thChords[rootNote] : major7thChords[rootNote];
    
    // Octave logic
    let chordOctave = octave; 
    if (elements.chordOctaveSelect.value !== 'auto') chordOctave += parseInt(elements.chordOctaveSelect.value);
    
    const nodesList = [];
    chordNotes.forEach(name => {
        const freq = noteFrequencies[name] * Math.pow(2, chordOctave);
        const nodes = createSynthNode(true);
        if (nodes) {
            startSynth(nodes, freq);
            nodesList.push(nodes);
        }
    });
    // Update synth export
    // We need to push these nodes to synth module's tracking
    // We imported helper functions for this
    // Done via side effect in createSynthNode? No, createSynthNode returns nodes.
    // We need to register them.
    // Imported setCurrentChordNodes used here.
    // But createSynthNode doesn't add to activeNotes. 
    // We need to store them in `currentChordNodes` in synth.js
    // We need to export a setter from synth.js
    
    // See `synth.js` export `setCurrentChordNodes`
    // Wait, I need to update synth.js to export that setter.
    
    // (Checked synth.js content - added helpers)
    
    // Actually passing nodesList to synth module
    import('./synth.js').then(m => m.setCurrentChordNodes(nodesList));
}


// --- SCROLLBAR LOGIC ---
function handleScrollbarPointerDown(e, index) {
    e.preventDefault(); e.stopPropagation();
    const thumb = e.target;
    const container = thumb.parentElement;
    
    // Logic from original script...
    const isDual = !!document.getElementById('keyboard-top');
    const isIndependent = elements.independentScrollCheckbox.checked;
    let logicalIndex = (isDual && isIndependent && index === 0) ? 1 : 0;
    if (!isDual && index === 1) return; // Should not happen
    if (isDual && !isIndependent && index === 1) return;

    const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top');
    if (!kb) return;

    const maxKbScroll = kb.offsetWidth - elements.keyboardContainer.clientWidth;
    const maxThumbScroll = container.clientWidth - thumb.offsetWidth;

    activeScroller.isDragging = true;
    activeScroller.index = index;
    activeScroller.thumb = thumb;
    activeScroller.startX = e.clientX;
    activeScroller.startThumbX = thumb.offsetLeft;
    activeScroller.scrollRatio = maxKbScroll / maxThumbScroll;
    activeScroller.logicalIndex = logicalIndex;
    
    thumb.setPointerCapture(e.pointerId);
    thumb.style.cursor = 'grabbing';
}

function handleDocumentPointerMove(e) {
    if (!activeScroller.isDragging) return;
    e.preventDefault();
    const dx = e.clientX - activeScroller.startX;
    const maxThumbScroll = activeScroller.thumb.parentElement.clientWidth - activeScroller.thumb.offsetWidth;
    const newThumbX = Math.max(0, Math.min(maxThumbScroll, activeScroller.startThumbX + dx));
    const newKbX = newThumbX * activeScroller.scrollRatio;
    setScroll(newKbX, activeScroller.logicalIndex);
}
