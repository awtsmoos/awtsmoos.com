
/**
 * B"H
 * @module JumpSound
 * @description
 * "He raises up the lowly."
 * Calculates the precise mathematical parameters for a jumping sound. 
 * Instead of playing a static file, this creates an oscillator sweep that physically ascends in pitch.
 */

export default class JumpSound {
    /**
     * Generates a dynamic blueprint for a jump.
     * @param {number} jumpVelocity - The force of the jump, altering the pitch and length.
     * @returns {Object} The JSON blueprint for the AudioEngine.
     */
    static generateBlueprint(jumpVelocity = 10) {
        // Base frequency starts low and sweeps high
        const baseFreq = 200 + (Math.random() * 50);
        // The harder the jump, the higher it sweeps
        const endFreq = baseFreq + (jumpVelocity * 30); 
        // Length of sound depends on the jump impulse
        const duration = Math.min(0.5, jumpVelocity * 0.03);

        return {
            type: "sine",
            frequencyStart: baseFreq,
            frequencyEnd: endFreq,
            duration: duration,
            attack: 0.05,
            volume: 0.5,
            frequencySweep: "linear"
        };
    }
}
