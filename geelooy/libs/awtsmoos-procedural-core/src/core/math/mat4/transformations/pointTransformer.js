
/**
 * B"H
 * THE PILGRIMAGE OF THE SPARK (POINT TRANSFORMER)
 * 
 * Chapter: The W-Division
 * A point in space holds a weight of reality. When it passes through the 
 * Perspective Matrix (the Lens of Creation), its dimensional weight (W) shifts!
 * To return the point to normal 3D reality, we must divide by W. This brings 
 * the infinite bounds of the clip space back into measurable reality.
 * 
 * @module PointTransformer
 */

export class PointTransformer {
    /**
     * B"H
     * Guides a 3D coordinate through the transformative gates of a Matrix.
     * Correctly handles Perspective Division (the W component).
     * 
     * @param {Array<number>} out - The resulting physical container [x, y, z]
     * @param {Array<number>} p - The original intent [x, y, z]
     * @param {Float32Array} m - The transformative Matrix
     * @returns {Array<number>} The actualized coordinate
     */
    static transform(out, p, m) {
        const x = p[0], y = p[1], z = p[2];
        
        // The Weight of Existence
        const w = m[3] * x + m[7] * y + m[11] * z + m[15];
        const invW = w ? 1.0 / w : 1.0;
        
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) * invW;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) * invW;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * invW;
        
        return out;
    }
}
