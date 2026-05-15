
// B"H
/**
 * @file transposition.js
 * @brief Flipping the grid of existence.
 * 
 * POETIC REFLECTION:
 * What was a Row is now a Column's rise,
 * Seeing the truth through different eyes.
 * We rotate the square, we shift the decree,
 * Unlocking the secrets of geometry.
 */

export class MatrixTransposer {
    /**
     * B"H - Transposes the matrix a into out.
     * @param {Float32Array|Array} out - Destination.
     * @param {Float32Array|Array} a - Source.
     * @returns {Float32Array|Array}
     */
    static execute(out, a) {
        const a01 = a[1], a02 = a[2], a03 = a[3];
        const a12 = a[6], a13 = a[7], a23 = a[11];

        out[0] = a[0]; out[1] = a[4]; out[2] = a[8]; out[3] = a[12];
        out[4] = a01; out[5] = a[5]; out[6] = a[9]; out[7] = a[13];
        out[8] = a02; out[9] = a12; out[10] = a[10]; out[11] = a[14];
        out[12] = a03; out[13] = a13; out[14] = a23; out[15] = a[15];
        return out;
    }
}
