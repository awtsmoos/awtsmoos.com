
// B"H
/**
 * @file matrixShatterer.js
 * @brief The Forge of the Inverse View-Projection.
 */

import { mat4_core } from '../../../../math/mat4/core.js';
import { MatrixComposer } from '../../../../math/mat4/operations/composition.js';

export class MatrixShatterer {
    /**
     * B"H - Unites and reverses the decrees of sight.
     * @param {Float32Array|Array<number>} proj - The Projection Matrix.
     * @param {Float32Array|Array<number>} view - The View Matrix.
     * @returns {Float32Array|null} The inverted VP matrix, or null if reality is singular.
     */
    static getInverseVP(proj, view) {
        if (!proj || !view) return null;

        const vp = new Float32Array(16);
        // B"H - Projection * View
        MatrixComposer.composeVP(vp, proj, view);

        const invVP = new Float32Array(16);
        if (!mat4_core.inverse(invVP, vp)) {
            console.error(`B"H - MatrixShatterer: Failed to invert View-Projection Matrix.`);
            return null;
        }

        return invVP;
    }
}
