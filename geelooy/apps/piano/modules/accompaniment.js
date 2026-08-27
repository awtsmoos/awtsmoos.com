
/* B"H */
// piano/modules/accompaniment.js
import { AudioState } from './audio.js';
import { createSynthNode, startSynth, stopSynth, activeNotes } from './synth.js';
import { elements } from './ui.js';
import { noteFrequencies, noteNames } from './input.js';

let intervalId = null;
let currentBassNotes = [];
let beatCounter = 0;
const BPM = 120;
const BEAT_TIME = 60 / BPM * 1000; // ms

export function startAccompaniment() {
    if (intervalId) return;
    intervalId = setInterval(tick, BEAT_TIME);
}

export function stopAccompaniment() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    stopBass();
}

function stopBass() {
    currentBassNotes.forEach(n => stopSynth(n));
    currentBassNotes = [];
}

function tick() {
    if (!elements.autoBassCheckbox.checked || activeNotes.size === 0) {
        if (currentBassNotes.length > 0) stopBass();
        return;
    }

    // Determine root note from active notes (simplest: lowest note)
    let lowestNoteFreq = Infinity;
    let lowestNoteName = null;
    
    // Scan active keys
    activeNotes.forEach((val, key) => {
        // Parse note name to freq
        const name = val.keyElement.dataset.note;
        const note = name.replace(/\d+/g, '');
        const octave = parseInt(name.match(/\d+/g));
        const freq = noteFrequencies[note] * Math.pow(2, octave);
        if (freq < lowestNoteFreq) {
            lowestNoteFreq = freq;
            lowestNoteName = note;
        }
    });

    if (!lowestNoteName) return;

    stopBass(); // Stop previous beat

    // Pattern: Root(Oct-1) -> 5th(Oct-1) -> Root(Oct) -> 5th(Oct-1)
    let targetNote = lowestNoteName;
    let octaveOffset = -1;
    
    const step = beatCounter % 4;
    
    if (step === 0) {
        // Root low
        targetNote = lowestNoteName;
        octaveOffset = -1;
    } else if (step === 1 || step === 3) {
        // 5th
        const rootIndex = noteNames.indexOf(lowestNoteName);
        targetNote = noteNames[(rootIndex + 7) % 12];
        // If 5th wraps around, it's higher, so maybe drop octave to keep it bassy
        if ((rootIndex + 7) >= 12) octaveOffset = -1;
        else octaveOffset = -1; 
    } else if (step === 2) {
        // Root high (original octave or -1 if user played high)
        targetNote = lowestNoteName;
        octaveOffset = 0; 
    }
    
    // Enforce Bass Range (C2 - C3 approx)
    // We base it relative to C3 (approx 130Hz)
    // Actually, let's just use the user's octave - 2
    
    const baseFreq = noteFrequencies[targetNote];
    // We need an octave. Let's assume user plays around C4. Bass should be C2.
    // We can infer average octave of user play
    let avgOctave = 4; // Default
    // Calculate real avg
    let sum = 0, count = 0;
    activeNotes.forEach((val) => {
       const name = val.keyElement.dataset.note;
       sum += parseInt(name.match(/\d+/g)[0]);
       count++;
    });
    if (count > 0) avgOctave = Math.floor(sum/count);
    
    const bassOctave = Math.max(1, avgOctave - 2 + octaveOffset);
    const finalFreq = baseFreq * Math.pow(2, bassOctave);

    const nodes = createSynthNode(false, true, { inputId: 'auto-bass', coords: { x: 0, y: 160 } });
    startSynth(nodes, finalFreq, targetNote + bassOctave);
    currentBassNotes.push(nodes);

    beatCounter++;
}
