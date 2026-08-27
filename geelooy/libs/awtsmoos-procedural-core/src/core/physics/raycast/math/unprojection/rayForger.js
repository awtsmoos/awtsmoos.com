
// B"H
/**
 * @file rayForger.js
 * @brief Legacy redirection node to the new modular engine.
 *
 * THE PARABLE OF THE OLD GATE
 *
 * In the great Temple of Code, there are ancient pathways, worn by the feet of forgotten functions.
 * The `RayForger` stands as a guard at one such gate. Its purpose is not to innovate, but to ensure
 * that those who travel the old roads still arrive at the new, shining destination.
 *
 * A decree went out that all rays must know their true origin, a truth held only within the Camera
 * vessel itself. The Old Gate, in its simplicity, was not aware of this new law and was letting travelers
 * pass without this essential knowledge. This scroll corrects the guard's instructions. Now, when a
 * legacy call arrives with a Camera, the `RayForger` ensures this precious vessel is not left behind,
 * but is passed faithfully to the `RayForgeMaster`.
 */

import { RayForgeMaster } from './engine/rayForgeMaster.js';

export class RayForger {
    /** 
     * B"H - Redirects legacy calls to the new modular forge, ensuring the Camera's essence is preserved.
     * @param {number} nx - Normalized X coordinate.
     * @param {number} ny - Normalized Y coordinate.
     * @param {Object} camera - The all-important Camera object.
     * @param {Float32Array} proj - The projection matrix.
     * @param {Float32Array} view - The view matrix.
     * @returns {Ray} A holy Ray, forged with the full truth of the camera's position.
     */
    static forge(nx, ny, camera, proj, view) {
        // B"H - The legacy path also must carry the vessel of the Camera's truth forward.
        return RayForgeMaster.forge(nx, ny, proj, view, camera);
    }
}
