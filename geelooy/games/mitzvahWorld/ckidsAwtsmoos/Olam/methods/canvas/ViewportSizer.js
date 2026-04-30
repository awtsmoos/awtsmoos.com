
/**
 * B"H
 * @module ViewportSizer
 * @description
 * Chapter 4: The Decree of Totality.
 * 
 * In the Seder Hishtalshelus (order of unfolding), the lower must always reflect 
 * the shape of its container. If the window is wide, the world must be wide. 
 * If the window is tall, the world must be tall.
 * 
 * This module eliminates the 'fitting' paradox that caused inversions and voids. 
 * It forces the digital realm to become a perfect mirror of the observer's reality.
 */

export default class ViewportSizer {
    /**
     * @function calculate
     * @description
     * Yields the absolute maximum available bounds.
     * 
     * @param {Object} input - { width, height } derived from the physical window.
     * @returns {Object} { newWidth, newHeight, orientation }
     */
    static calculate(input) {
        const { width, height } = input;
        
        // B"H: We match the Light (Renderer) to the Vessel (Window) 1:1.
        // No aspect-ratio masks, only pure manifestation.
        return { 
            newWidth: width, 
            newHeight: height, 
            orientation: width > height ? "horizontal" : "vertical" 
        };
    }
}
