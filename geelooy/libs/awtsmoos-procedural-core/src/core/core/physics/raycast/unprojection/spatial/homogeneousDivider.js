
// B"H
/**
 * @file homogeneousDivider.js
 * @brief The Altar of the 'W'. 
 * 
 * POETRY OF DIVISION:
 * A point in the Matrix is four components deep,
 * Until the 'W' is divided, the truth will still sleep.
 * We divide X, Y, and Z by the weight of the soul,
 * To bring the 3D spark to its ultimate goal.
 */

export class HomogeneousDivider {
    /**
     * B"H - Divides the vector [x, y, z] by its homogeneous weight w.
     * @param {Array<number>} vec4 - [x, y, z, w]
     * @returns {Array<number>} The 3D world coordinate [x/w, y/w, z/w]
     */
    static divide(vec4) {
        const w = vec4[3];
        const invW = (Math.abs(w) > 1e-12) ? 1.0 / w : 1.0;
        return [
            vec4[0] * invW,
            vec4[1] * invW,
            vec4[2] * invW
        ];
    }
}
