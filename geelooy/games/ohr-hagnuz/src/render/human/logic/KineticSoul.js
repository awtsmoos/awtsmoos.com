
/**
 * B"H
 * @class KineticSoul
 * @chapter The Breath of Action
 * @description
 * Calculates the sine-wave oscillations of the walk cycle. 
 * Everything in the universe is vibrating; we simply map 
 * that vibration into the vertical 'bob' and the horizontal 'swing'.
 */
export class KineticSoul {
    /**
     * @description Resolves the current mechanical state of the walk.
     * @param {number} progress - A value from 0 to 1 representing step completion.
     * @param {number} size - Tile resolution.
     * @returns {Object} The calculated bob and swing offsets.
     */
    static calculate(progress, size) {
        // The heartbeat of the step
        const phase = Math.sin(progress * Math.PI * 2);
        
        return {
            phase: phase,
            // Vertical movement (Kfitzat HaDerech)
            bob: Math.abs(phase) * (size / 22),
            // Limb oscillation (Chesed vs Gevurah)
            swing: phase * (size / 4.8)
        };
    }
}
