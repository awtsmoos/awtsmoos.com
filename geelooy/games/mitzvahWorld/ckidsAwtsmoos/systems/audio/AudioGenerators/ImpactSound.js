
/**
 * B"H
 * @module ImpactSound
 * @description
 * "All are of the dust, and all turn to dust again." (Kohelet 3:20)
 * Generates the sonic wave of a physical vessel returning to the ground. 
 * The intensity and depth of the sound directly correlate to the mathematical velocity of the fall.
 */

export default class ImpactSound {
    /**
     * Generates a dynamic blueprint for an impact.
     * @param {number} downwardVelocity - The negative Y velocity right before hitting the floor.
     * @returns {Object} The JSON blueprint for the AudioEngine.
     */
    static generateBlueprint(downwardVelocity = 0) {
        const speed = Math.abs(downwardVelocity);
        
        // A gentle step is a light tap. A massive fall is a deep thud.
        let volume = 0.2 + (speed * 0.05);
        volume = Math.min(1.0, volume);

        let filterFreq = 1000 - (speed * 30);
        filterFreq = Math.max(100, Math.min(1000, filterFreq));

        let duration = 0.1 + (speed * 0.01);
        duration = Math.min(0.4, duration);

        return {
            type: "noise",
            duration: duration,
            attack: 0.01,
            volume: volume,
            filterType: "lowpass",
            filterFreq: filterFreq
        };
    }
}
