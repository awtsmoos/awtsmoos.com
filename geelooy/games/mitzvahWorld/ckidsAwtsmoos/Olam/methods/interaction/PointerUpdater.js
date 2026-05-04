
// B"H
/**
 * @module PointerUpdater
 * @description
 * 🎯 CHAPTER 18: THE ALIGNMENT OF THE ARROW 🎯
 * 
 * "He bent His bow and set me as a mark for the arrow." (Eichah 3:12)
 * Before the eye (Raycaster) can pierce the void to find an object, it must know 
 * exactly where the soul intends to look. This module captures the physical X/Y 
 * pixel coordinates from the browser and transforms them into the spiritual -1 to 1 
 * normalized space required by Three.js.
 */

export default class PointerUpdater {
    /**
     * @method update
     * @description Converts absolute physical pixels to normalized spiritual coordinates.
     * @param {Object} olam - The master world instance.
     * @param {number} clientX - The horizontal pixel.
     * @param {number} clientY - The vertical pixel.
     */
    static update(olam, clientX, clientY) {
        if (!olam || !olam.pointer) return;

        // Default to the known bounds of the universe if specific rect isn't passed
        const width = olam.width || 1920;
        const height = olam.height || 1080;
        const left = 0;
        const top = 0;

        // B"H: The Mathematical Translation
        // Maps [0, width] to [-1, 1]
        olam.pointer.x = ((clientX - left) / width) * 2 - 1;
        // Maps[0, height] to [1, -1] (Y is inverted in WebGL space)
        olam.pointer.y = -((clientY - top) / height) * 2 + 1;

        // Update the physical mouse tracker for UI popups
        if (olam.achbar) {
            olam.achbar.x = clientX;
            olam.achbar.y = clientY;
        }

        // B"H: silent

    }
}
