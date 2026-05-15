
// B"H
/**
 * @file inversionVault.js
 * @brief Breaking the vessels of the screen to find the sparks of reality.
 */

import { mat4_core } from '../../../../../../math/mat4/core.js';

export class InversionVault {
    /**
     * B"H - Computes the inverse of a 4x4 matrix or returns null.
     */
    static getInverse(matrix) {
        const inv = new Float32Array(16);
        if (!mat4_core.inverse(inv, matrix)) return null;
        return inv;
    }
}
