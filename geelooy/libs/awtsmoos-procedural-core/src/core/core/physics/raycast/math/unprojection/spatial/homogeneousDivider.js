
// B"H
/**
 * @file homogeneousDivider.js
 * @brief Restoring the 3D spark from its 4D expansion.
 */

export class HomogeneousDivider {
    /**
     * B"H - Divides the vector [x, y, z, w] by the weight w.
     */
    static divide(v4) {
        const w = v4[3];
        const invW = (Math.abs(w) > 1e-15) ? 1.0 / w : 1.0;
        return [v4[0] * invW, v4[1] * invW, v4[2] * invW];
    }
}
