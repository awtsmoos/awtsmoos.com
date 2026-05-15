
/**
 * B"H
 * THE FORGE OF THE KAV (RAY) - PERFECTED
 * 
 * Chapter: The True Direction
 * A beam of light must have a source and a destination. 
 * The destination is the user's click on the physical screen (NDC coordinates),
 * pushed to the "Far Plane" of the mathematical universe.
 * The source is the true, absolute position of the Camera (The Eye of the Soul).
 * 
 * By unprojecting the Far Point and subtracting the True Camera Origin,
 * we eliminate all matrix mismatch bugs. The Ray shoots perfectly straight.
 * 
 * @module RayForgeMaster
 */

import { Ray } from '../../../ray.js';
import { CameraTruth } from '../cameraTruth.js';
import { mat4_core } from '../../../../../math/mat4/core.js';
import { Vec3 } from '../../../../../math/vec3.js';

export class RayForgeMaster {
    /**
     * B"H
     * Forges the undeniable line of interaction.
     * @param {number} nx - Normalized X (-1 to 1)
     * @param {number} ny - Normalized Y (-1 to 1)
     * @param {Float32Array} proj - Projection Matrix
     * @param {Float32Array} view - View Matrix
     * @param {Object} camera - The Observer
     */
    static forge(nx, ny, proj, view, camera, renderer = null) {
        if (!proj || !view) throw new Error(`B"H - RayForgeMaster: Matrices vanished!`);

        // 1. The Union of Perspective and Position
        const projView = mat4_core.multiply(new Float32Array(16), proj, view);
        
        // 2. The Inverse: Tearing open the veil to see reality behind the screen
        const invProjView = mat4_core.inverse(new Float32Array(16), projView);
        if (!invProjView) throw new Error(`B"H - RayForgeMaster: Matrix inversion failed!`);

        // 3. Unproject the Far Point (Z = 1.0 in WebGL NDC)
        const farPointClip = [nx, ny, 1.0];
        const farWorld = mat4_core.transformPoint([], farPointClip, invProjView);

        // 4. Secure the absolute truth of the Origin
        const origin = CameraTruth.getAbsolutePosition(camera, renderer);

        // 5. The Intent is the path from the Origin to the Far Horizon
        const direction = Vec3.normalize(Vec3.sub(farWorld, origin));

        return new Ray(origin, direction);
    }
}
