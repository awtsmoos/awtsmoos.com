
// B"H
/**
 * @file pointExpander.js
 * @brief Reversing the squashing of the viewport.
 */

import { HomogeneousDivider } from './homogeneousDivider.js';

export class PointExpander {
    /**
     * B"H - Expands an NDC point [nx, ny, nz] into world space.
     * @param {number} nx - Normalized X
     * @param {number} ny - Normalized Y
     * @param {number} nz - Normalized Z
     * @param {Float32Array} invVP - Inverted View-Projection Matrix
     * @returns {Array<number>} The 3D World Coordinate.
     */
    static expand(nx, ny, nz, invVP) {
        const m = invVP;
        const x = nx, y = ny, z = nz;

        // Multiply vector [x, y, z, 1] by the Inverse VP Matrix
        const rw = m[3] * x + m[7] * y + m[11] * z + m[15];
        const rx = m[0] * x + m[4] * y + m[8] * z + m[12];
        const ry = m[1] * x + m[5] * y + m[9] * z + m[13];
        const rz = m[2] * x + m[6] * y + m[10] * z + m[14];

        return HomogeneousDivider.divide([rx, ry, rz, rw]);
    }
}
