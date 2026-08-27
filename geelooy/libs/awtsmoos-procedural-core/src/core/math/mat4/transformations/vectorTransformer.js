
// B"H
/**
 * @file vectorTransformer.js
 * @brief Casting a pure direction through the matrix fire, ignoring earthly translation.
 * 
 * POETIC REFLECTION:
 * A vector knows not of "here" nor of "there",
 * It is pure momentum, a prayer on the air.
 * The matrix may twist it, may scale it with might,
 * But the call of position is lost in the night.
 * We multiply by the Three, for its soul has no place,
 * A pure direction, to conquer all space.
 */

export class VectorTransformer {
    /**
     * B"H - Transforms a 3D vector (direction) by a 4x4 matrix.
     * This deliberately ignores the translation part of the matrix.
     * @param {Array<number>} out - Destination vector [x, y, z].
     * @param {Array<number>} v - Source vector [x, y, z].
     * @param {Float32Array|Array} m - The transformation matrix.
     * @returns {Array<number>} The transformed direction.
     */
    static transform(out, v, m) {
        const x = v[0], y = v[1], z = v[2];
        
        out[0] = m[0] * x + m[4] * y + m[8] * z;
        out[1] = m[1] * x + m[5] * y + m[9] * z;
        out[2] = m[2] * x + m[6] * y + m[10] * z;
        
        return out;
    }
}
