
// B"H
/**
 * @file inversionVault.js
 * @brief Reclaiming the truth through inversion.
 */

import { mat4_core } from '../../../../math/mat4/core.js';

export class InversionVault {
    /**
     * B"H - Returns the inverse of a matrix or null if reality is flat.
     */
    static getInverse(matrix) {
        const inv = new Float32Array(16);
        if (!mat4_core.inverse(inv, matrix)) {
            console.error(`B"H - InversionVault: Singular Matrix detected! The path is blocked.`);
            return null;
        }
        return inv;
    }
}
