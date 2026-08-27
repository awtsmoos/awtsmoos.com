// B"H

/**
 * This module is the celestial choir master, responsible for producing the sounds of creation.
 * It uses the Web Audio API to ensure that the music of the spheres is heard instantly and clearly.
 * 
 * It now plays the "Ro'eh Yisroel" Niggun, note by note, with every impact.
 */

let audioCtx = null;

// The Fundamental Frequency (A2)
// The user specified "just A is A2", so we start here.
const BASE_FREQ = 110.00; 

// Mapping letters to semitones relative to A2 (Natural Minor / A Minor)
// A=0, B=2, C=3, D=5, E=7, F=8, G=10, A3=12
const NOTE_MAPPING = {
    'A': 0,
    'B': 2,
    'C': 3,
    'D': 5,
    'E': 7,
    'F': 8,
    'G': 10,
    'A3': 12
};

// The Sequence: "Ro'eh Yisroel"
const RAW_SONG_DATA = `
AAADCBABCBAABCADBCBABC
AAADCBABCBACECDACBA
AAADCBABCBAABCADBCBABC
AAAFEDABCBACECDACBA
A3A3A3A3A3EFGGFEDACAECDCDEA3
A3A3A3A3A3EFGGFEDACAECDACBA
EEFEDDEDCCACEEDE
EFEDDEDCCADDCA
`;

// Parsing logic to handle "A3" as a single note, vs "A" as a single note.
const parseSong = (data) => {
    const sequence = [];
    // Remove newlines and spaces
    const cleanData = data.replace(/\s+/g, '');
    
    for (let i = 0; i < cleanData.length; i++) {
        const char = cleanData[i];
        const nextChar = cleanData[i + 1];
        
        if (char === 'A' && nextChar === '3') {
            sequence.push(NOTE_MAPPING['A3']);
            i++; // Skip the '3'
        } else if (NOTE_MAPPING.hasOwnProperty(char)) {
            sequence.push(NOTE_MAPPING[char]);
        }
    }
    return sequence;
};

const MELODY_SEQUENCE = parseSong(RAW_SONG_DATA);

let currentNoteIndex = 0;

/**
 * The divine command to bring forth the potential for sound. Must be called by a user's action.
 * This sacred pact with the browser allows the universe to have a voice.
 */
export function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {
        console.error("The universe is muted. Web Audio API is not supported.", e);
    }
}

/**
 * Calculates the frequency for a given semitone offset from Base (A2).
 */
function getFrequency(semitone) {
    return BASE_FREQ * Math.pow(2, semitone / 12);
}

/**
 * A private helper to create and play a single tone with a specific envelope.
 * It is the fundamental building block of all sound in this world.
 */
function playFrequency(freq, time, duration, type = 'triangle', gain = 0.5) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, time);

    // ADSR Envelope for a plucky, harp-like sound
    const attack = 0.01;
    const decay = 0.1;
    const sustain = 0.3;
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(gain, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(gain * sustain, time + attack + decay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);
}

/**
 * Plays a specific note by its semitone offset from Base.
 * Used for specific game events (Portals, Golems, etc.) distinct from the main melody.
 * @param {number} semitone The semitone offset.
 */
export function playNote(semitone) {
    if (!audioCtx || audioCtx.state === 'suspended') {
        audioCtx?.resume();
    }
    const freq = getFrequency(semitone);
    const now = audioCtx ? audioCtx.currentTime : 0;
    // We use a sine wave for these specific effect notes to distinguish them from the melody
    playFrequency(freq, now, 0.4, 'sine', 0.3);
}

/**
 * Advances the Divine Symphony by one note.
 * Called whenever a spark is elevated (a brick is hit).
 */
export function playNextNote() {
    if (!audioCtx || audioCtx.state === 'suspended') {
        audioCtx?.resume();
    }
    
    const semitone = MELODY_SEQUENCE[currentNoteIndex];
    const freq = getFrequency(semitone);
    const now = audioCtx.currentTime;
    
    // Vary the instrument slightly based on pitch for texture
    // For this range (A2-F3), triangle is good and bassy/warm.
    const type = 'triangle';
    const duration = 0.5;
    
    playFrequency(freq, now, duration, type, 0.4);
    
    // Advance the melody, looping eternally
    currentNoteIndex = (currentNoteIndex + 1) % MELODY_SEQUENCE.length;
}

/**
 * Sounds a triumphant, three-note major chord to celebrate a victory.
 */
export function playVictoryFanfare() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    // A Major Chord (A3 range)
    playFrequency(getFrequency(12), now, 0.6, 'square', 0.3); // A3
    playFrequency(getFrequency(16), now, 0.6, 'square', 0.3); // C#4
    playFrequency(getFrequency(19), now, 0.6, 'square', 0.3); // E4
}

/**
 * Plays a high, pleasant, bell-like ping, often to accompany a positive UI event like a star appearing.
 */
export function playStarPing() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    playFrequency(getFrequency(24), now, 0.4, 'sine', 0.3); // A4
}