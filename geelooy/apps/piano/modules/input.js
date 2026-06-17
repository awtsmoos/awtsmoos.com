/* B"H
Input must be lightning: no dynamic import, no comments in the hot path, only note truth passing into sound.
*/
import { AudioState } from './audio.js';
import { createSynthNode, startSynth, stopSynth, activeNotes, currentChordRoot, clearCurrentChord, setCurrentChordRoot, setCurrentChordNodes } from './synth.js';
import { deferRelease, clearDeferred } from './performance/pedal.js';
import { elements, setScroll, scrollState, activeScroller } from './ui.js';
import { recordingState, logVideoKeyDown, logVideoKeyUp, logTextNote } from './recorder.js';
import { showRealtimeEffect } from './visual/liveEffects.js';

export const noteFrequencies = { C:16.35, 'C#':17.32, D:18.35, 'D#':19.45, E:20.6, F:21.83, 'F#':23.12, G:24.5, 'G#':25.96, A:27.5, 'A#':29.14, B:30.87 };
export const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const major7thChords = { C:['C','E','G','B'], D:['D','F#','A','C#'], E:['E','G#','B','D#'], F:['F','A','C','E'], G:['G','B','D','F#'], A:['A','C#','E','G#'], B:['B','D#','F#','A#'] };
const minor7thChords = { C:['C','D#','G','A#'], D:['D','F','A','C'], E:['E','G','B','D'], F:['F','G#','C','D#'], G:['G','A#','D','F'], A:['A','C','E','G'], B:['B','D','F#','A'] };
const KEY_TO_NOTE_OFFSET = { a:{n:'C',o:0}, w:{n:'C#',o:0}, s:{n:'D',o:0}, e:{n:'D#',o:0}, d:{n:'E',o:0}, f:{n:'F',o:0}, t:{n:'F#',o:0}, g:{n:'G',o:0}, y:{n:'G#',o:0}, h:{n:'A',o:0}, u:{n:'A#',o:0}, j:{n:'B',o:0}, k:{n:'C',o:1}, o:{n:'C#',o:1}, l:{n:'D',o:1}, p:{n:'D#',o:1}, ';':{n:'E',o:1}, "'":{n:'F',o:1} };

export function setupInputListeners() {
    elements.keyboardContainer.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUpOrCancel);
    document.addEventListener('pointercancel', handlePointerUpOrCancel);
    elements.customScrollbarThumb.addEventListener('pointerdown', e => handleScrollbarPointerDown(e, 0));
    elements.customScrollbarThumbTop.addEventListener('pointerdown', e => handleScrollbarPointerDown(e, 1));
    document.addEventListener('pointermove', handleDocumentPointerMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}
function handlePointerDown(e) {
    const keyElement = e.target.closest('.key');
    if (!keyElement || activeNotes.has(e.pointerId)) return;
    e.preventDefault();
    const rect = keyElement.getBoundingClientRect();
    triggerNoteOn(keyElement.dataset.note, e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top }, keyElement);
}
function handlePointerUpOrCancel(e) {
    if (activeScroller.isDragging) {
        activeScroller.thumb.style.cursor = 'grab'; activeScroller.isDragging = false;
        localStorage.setItem('pianoScrollState', JSON.stringify(scrollState));
    }
    triggerNoteOff(e.pointerId);
}
function noteNameForKeyboardMapping(mapping) {
    const startOctave = parseInt(elements.octaveSelect.value || '0', 10);
    return `${mapping.n}${startOctave + mapping.o}`;
}
function handleKeyDown(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.target.tagName === 'INPUT') return;
    const mapping = KEY_TO_NOTE_OFFSET[e.key.toLowerCase()]; if (!mapping) return;
    const pid = `kb-${e.key.toLowerCase()}`; if (activeNotes.has(pid)) return;
    const noteName = noteNameForKeyboardMapping(mapping), keyElement = document.querySelector(`.key[data-note="${noteName}"]`);
    if (!keyElement) return;
    const rect = keyElement.getBoundingClientRect();
    triggerNoteOn(noteName, pid, { x: rect.width / 2, y: rect.height / 2 }, keyElement);
}
function handleKeyUp(e) { if (KEY_TO_NOTE_OFFSET[e.key.toLowerCase()]) triggerNoteOff(`kb-${e.key.toLowerCase()}`); }
export function triggerNoteOn(noteName, inputId, coords, keyElement) {
    const note = noteName.replace(/\d/g, ''); keyElement = keyElement || document.querySelector(`.key[data-note="${noteName}"]`);
    if (!keyElement) return;
    const octave = parseInt(noteName.match(/\d+/g), 10), frequency = noteFrequencies[note] * Math.pow(2, octave);
    if (elements.playChordsCheckbox.checked) triggerChord(note, octave);
    clearDeferred(inputId);
    const synthNodes = createSynthNode(false, false, { inputId, coords }); if (!synthNodes) return;
    startSynth(synthNodes, frequency, noteName); activeNotes.set(inputId, { synthNodes, keyElement }); keyElement.classList.add('active'); showRealtimeEffect(keyElement, noteName, coords);
    if (recordingState.isVideoRecording) logVideoKeyDown(noteName, coords);
    if (recordingState.isTextRecording) logTextNote(noteName);
    if (recordingState.isSheetRecording) activeNotes.get(inputId).sheetMusicStartTime = AudioState.context.currentTime - recordingState.sheetRecordingStartTime;
}
export function triggerNoteOff(inputId) {
    const activeNote = activeNotes.get(inputId); if (!activeNote) return;
    if (!deferRelease(inputId, activeNote)) stopSynth(activeNote.synthNodes);
    activeNote.keyElement.classList.remove('active');
    const noteName = activeNote.keyElement.dataset.note; activeNotes.delete(inputId);
    if (activeNotes.size === 0 && elements.playChordsCheckbox.checked) clearCurrentChord();
    if (recordingState.isSheetRecording && activeNote.sheetMusicStartTime !== undefined) {
        const endTime = AudioState.context.currentTime - recordingState.sheetRecordingStartTime;
        recordingState.sheetNotes.push({ note: noteName, start: activeNote.sheetMusicStartTime, duration: endTime - activeNote.sheetMusicStartTime });
    }
    if (recordingState.isVideoRecording) logVideoKeyUp(noteName);
}
function triggerChord(note, octave) {
    const rootNote = note.replace('#', ''); if (!major7thChords[rootNote] || rootNote === currentChordRoot) return;
    clearCurrentChord(); setCurrentChordRoot(rootNote);
    const quality = elements.chordModeSelect.value === 'minor' ? 'minor' : 'major';
    let chordOctave = octave; if (elements.chordOctaveSelect.value !== 'auto') chordOctave += parseInt(elements.chordOctaveSelect.value, 10);
    const nodesList = [];
    (quality === 'minor' ? minor7thChords[rootNote] : major7thChords[rootNote]).forEach(name => {
        const freq = noteFrequencies[name] * Math.pow(2, chordOctave), nodes = createSynthNode(true, false, { inputId: `chord-${name}`, coords: { x: 0, y: 0 } });
        if (nodes) { startSynth(nodes, freq, name + chordOctave); nodesList.push(nodes); }
    });
    setCurrentChordNodes(nodesList);
}
function handleScrollbarPointerDown(e, index) {
    e.preventDefault(); e.stopPropagation();
    const thumb = e.target, container = thumb.parentElement, isDual = !!document.getElementById('keyboard-top'), isIndependent = elements.independentScrollCheckbox.checked;
    const logicalIndex = (isDual && isIndependent && index === 0) ? 1 : 0;
    if ((!isDual && index === 1) || (isDual && !isIndependent && index === 1)) return;
    const kb = logicalIndex === 0 ? document.getElementById('keyboard-bottom') : document.getElementById('keyboard-top'); if (!kb) return;
    activeScroller.isDragging = true; activeScroller.index = index; activeScroller.thumb = thumb; activeScroller.startX = e.clientX; activeScroller.startThumbX = thumb.offsetLeft;
    activeScroller.scrollRatio = (kb.offsetWidth - elements.keyboardContainer.clientWidth) / (container.clientWidth - thumb.offsetWidth); activeScroller.logicalIndex = logicalIndex;
    thumb.setPointerCapture(e.pointerId); thumb.style.cursor = 'grabbing';
}
function handleDocumentPointerMove(e) {
    if (!activeScroller.isDragging) return; e.preventDefault();
    const dx = e.clientX - activeScroller.startX, max = activeScroller.thumb.parentElement.clientWidth - activeScroller.thumb.offsetWidth;
    setScroll(Math.max(0, Math.min(max, activeScroller.startThumbX + dx)) * activeScroller.scrollRatio, activeScroller.logicalIndex);
}

