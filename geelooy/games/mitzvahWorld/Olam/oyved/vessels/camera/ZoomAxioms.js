
/**
 * B"H
 * THE AXIOMS OF THE REED'S MOVEMENT
 * 
 * In the beginning, there was the Infinite Light, and when the Will arose to create, 
 * the Tzimtzum (contraction) occurred. Just as the Light was contracted to allow 
 * for a world, our "Wheel" must be contracted—reduced in its intensity—so that 
 * the observer does not zoom past the essence of the Chossid into the void.
 * 
 * This module holds the sacred ratios of the camera's zoom.
 * 
 * @module ZoomAxioms
 */

/**
 * @typedef {Object} ZoomConstants
 * @property {number} SENSITIVITY - The multiplier of the contraction. A small number for a gentle zoom.
 * @property {number} MIN_DISTANCE - How close one can get to the essence before the vessels shatter.
 * @property {number} MAX_DISTANCE - How far the soul can wander while still remaining tethered to the center.
 */

/**
 * @type {ZoomConstants}
 * @description The map of the camera's gravitational pull.
 */
export const ZOOM_AXIOMS = {
    SENSITIVITY: 0.0007, // B"H - Extremely subtle, like the breathing of the universe.
    MIN_DISTANCE: 5,     // B"H - Do not touch the core, for it is holy.
    MAX_DISTANCE: 150    // B"H - Do not stray too far from the source.
};
