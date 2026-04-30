
/**
 * B"H
 * @module SoundData
 * @description
 * Declarative JSON blueprints for synthesized audio. 
 * Replaces cumbersome .ogg and .mp3 files with lightweight, instant mathematics.
 */
export default {
    "jump": {
        type: "sine",
        frequencyStart: 300,
        frequencyEnd: 600,
        duration: 0.3,
        attack: 0.05,
        volume: 0.5,
        frequencySweep: "linear"
    },
    "hit_floor": {
        type: "noise",
        duration: 0.2,
        attack: 0.01,
        volume: 0.6,
        filterType: "lowpass",
        filterFreq: 400 // Deep thud
    },
    "step": {
        type: "noise",
        duration: 0.1,
        attack: 0.01,
        volume: 0.15,
        filterType: "bandpass",
        filterFreq: 800 // Crunchy gravel/grass sound
    },
    "ding": {
        type: "triangle",
        frequencyStart: 880, // A5
        frequencyEnd: 880,
        duration: 0.6,
        attack: 0.02,
        volume: 0.7,
        frequencySweep: "linear"
    },
    "error": {
        type: "sawtooth",
        frequencyStart: 150,
        frequencyEnd: 100,
        duration: 0.4,
        attack: 0.05,
        volume: 0.5,
        frequencySweep: "exponential"
    }
};
