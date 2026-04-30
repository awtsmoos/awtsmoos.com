
import { StateRegister } from '../../binah/StateRegister.js';

/**
 * B"H
 * GaitCalculator: The Rhythm of the Step.
 * 
 * Chapter: The Measurement of the Path.
 * "Prepare the path for your feet" (Proverbs 4:26). 
 * This class calculates which phase of the 6-frame walk cycle is 
 * currently manifest. It divides the 64-pixel stride into 
 * equal segments, ensuring that the visual representation matches 
 * the physical distance covered in Asiyah.
 * 
 * @class GaitCalculator
 */
export class GaitCalculator {
    /**
     * Resolves the current frame key for a walking entity.
     * @param {string} prefix - The entity prefix (e.g., 'HERO_D')
     * @param {number} stepTick - Progress from 0 to 63.
     * @param {boolean} isMoving - Is the entity currently active?
     * @returns {string} The specific frame identifier.
     */
    static calculate(prefix, stepTick, isMoving) {
        if (!isMoving) return `${prefix}_F1`;

        const resolution = StateRegister.Resolution || 64;
        const totalFrames = 6;
        
        // Map the 0-63 progress to 1-6 frame index
        const frameIndex = Math.floor((stepTick / resolution) * totalFrames) + 1;
        const safeIndex = Math.min(Math.max(frameIndex, 1), totalFrames);
        
        return `${prefix}_F${safeIndex}`;
    }
}
