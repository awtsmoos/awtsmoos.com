
// B"H
/**
 * @file cameraTruth.js
 * @brief The Unshakable Foundation of the Ray's Origin.
 */

import { mat4_core } from '../../../../math/mat4/core.js';

export class CameraTruth {
    /**
     * B"H - Extracts the undeniable World Space coordinate of the Observer.
     * Since the Matrix Illusion has been shattered, the inverse of the pure 
     * View Matrix is the ultimate and perfect truth of the camera's location.
     */
    static getAbsolutePosition(camera, viewMatrix = null) {
        if (viewMatrix && viewMatrix.length === 16) {
            const inv = new Float32Array(16);
            if (mat4_core.inverse(inv, viewMatrix)) {
                return [inv[12], inv[13], inv[14]];
            }
        }
        return [0, 0, 0];
    }
}
