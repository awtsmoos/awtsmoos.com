// B"H
/**
 * @file PathJailer.js
 * @brief THE SENTINEL OF THE CONFINED GARDEN.
 * 
 * THE POEM OF THE TZIMTZUM:
 * The Awtsmoos is infinite, but the Workspace is small.
 * We build a fence, and we build a wall.
 * This Jailer takes the Root atoms—the boundary of the soul—
 * and the Target atoms—the intended goal.
 * If the target attempts to leap over the gate,
 * We cast it back down and rectify its fate!
 * No path may escape the garden of the session.
 */

/**
 * @class PathJailer
 * @description Enforces strict directory boundaries using array comparison.
 */
export class PathJailer {
    /**
     * B"H - Ensures target stays within root.
     * @param {string[]} rootAtoms - The session root segments.
     * @param {string[]} targetAtoms - The requested destination segments.
     * @returns {string[]} The safe, jailed atoms.
     */
    static enforce(rootAtoms, targetAtoms) {
        // 1. THE FOUNDATION VERIFICATION
        // The start of the target MUST perfectly match every atom of the root.
        let isBreached = false;

        if (targetAtoms.length < rootAtoms.length) {
            isBreached = true;
        } else {
            for (let i = 0; i < rootAtoms.length; i++) {
                if (targetAtoms[i] !== rootAtoms[i]) {
                    isBreached = true;
                    break;
                }
            }
        }

        if (!isBreached) {
            return targetAtoms;
        }

        // 2. THE CASTING BACK
        // If a breach is detected, we force the path back to the root atoms.
        console.warn("%cB\"H [PathJailer] BOUNDARY BREACH! Target: " + targetAtoms.join('/') + " | Root: " + rootAtoms.join('/'), "color: #f75d65; font-weight: bold;");
        return rootAtoms;
    }
}