
import { ZOOM_AXIOMS } from './ZoomAxioms.js';

/**
 * B"H
 * CHAPTER: THE TURNING OF THE SPHERES
 * 
 * Every notch of the mouse wheel is a word spoken by the user. If the words are too 
 * loud, the world trembles. We must filter these words through the SENSITIVITY 
 * of the Awtsmoos, ensuring each 'deltaY' is but a tiny spark in the vastness.
 * 
 * This class processes the wheel event to calculate the new distance of the camera.
 * 
 * @class ZoomProcessor
 */
export class ZoomProcessor {
    /**
     * B"H
     * Transforms the raw energy of the scroll wheel into a calibrated zoom delta.
     * 
     * @param {number} deltaY - The raw vertical scroll amount from the user's vessel.
     * @param {number} currentDistance - The current tether length of the camera.
     * @returns {number} The new distance, harmonized and clamped.
     */
    static process(deltaY, currentDistance) {
        // B"H - The Speech is filtered.
        const movement = deltaY * ZOOM_AXIOMS.SENSITIVITY;
        
        // B"H - The new state is birthed from the old.
        let newDistance = currentDistance + movement;

        // B"H - Clamping the distance to ensure the soul stays within the designated boundaries.
        if (newDistance < ZOOM_AXIOMS.MIN_DISTANCE) {
            newDistance = ZOOM_AXIOMS.MIN_DISTANCE;
        }
        if (newDistance > ZOOM_AXIOMS.MAX_DISTANCE) {
            newDistance = ZOOM_AXIOMS.MAX_DISTANCE;
        }

        return newDistance;
    }
}
