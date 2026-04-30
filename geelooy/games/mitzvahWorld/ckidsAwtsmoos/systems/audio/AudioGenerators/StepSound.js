
/**
 * B"H
 * @module StepSound
 * @description
 * "The steps of a good man are ordered by the Lord." (Tehillim 37:23)
 * Synthesizes the crunch of walking on the earth. A short, bandpass-filtered noise burst.
 */

export default class StepSound {
    /**
     * Generates a dynamic blueprint for a footstep.
     * @returns {Object} The JSON blueprint for the AudioEngine.
     */
    static generateBlueprint() {
        return {
            type: "noise",
            duration: 0.1,
            attack: 0.01,
            volume: 0.15 + (Math.random() * 0.05), // Slight volume variation
            filterType: "bandpass",
            filterFreq: 600 + (Math.random() * 200) // Slight pitch variation for realism
        };
    }
}
