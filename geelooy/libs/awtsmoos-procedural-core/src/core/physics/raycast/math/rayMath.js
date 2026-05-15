
/**
 * B"H
 * THE BULLETPROOF MATHEMATICS OF THE ESSENCE
 * 
 * Chapter: The Immutable Laws Expansion
 * The Awtsmoos provides exactly what is needed, and nothing more.
 * To move an object across the dimensions, we must calculate the exact point 
 * where the Ray of Intent strikes an invisible Flat Plane (the Drag Plane).
 * Here we introduce the sacred Vector operations and the Plane Intersection 
 * decree, ensuring the math is perfectly isolated and completely infallible.
 * 
 * @class RayMath
 */
export class RayMath {
    /**
     * B"H
     * Inverts a 4x4 Matrix. The Ultimate Tzimtzum Reversal.
     * @param {Float32Array|Array} m - The matrix of the physical world.
     * @returns {Float32Array|null} The spiritual inverse.
     */
    static invert4x4(m) {
        const out = new Float32Array(16);
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1.0 / det;

        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return out;
    }

    /**
     * B"H
     * Multiplies a 4x4 matrix by a 4D vector. Column-major perfection.
     */
    static transformVec4(m, v) {
        const out = new Float32Array(4);
        out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3];
        out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3];
        out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3];
        out[3] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3];
        return out;
    }

    /** B"H - Pure Vector Math */
    static dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
    static sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
    static add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
    static scale(a, scalar) { return [a[0]*scalar, a[1]*scalar, a[2]*scalar]; }

    /** B"H - Normalizes a 3D vector */
    static normalize(v) {
        const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0,0,0];
    }

    /** B"H - Distance between two points */
    static dist(a, b) {
        const x = a[0]-b[0], y = a[1]-b[1], z = a[2]-b[2];
        return Math.sqrt(x*x + y*y + z*z);
    }

    /**
     * B"H
     * THE INVISIBLE PARSA (PLANE INTERSECTION)
     * Calculates exactly where the Ray hits a mathematical plane.
     * Essential for dragging objects in 3D space.
     * 
     * @param {Array<number>} origin - Ray origin
     * @param {Array<number>} dir - Ray direction
     * @param {Array<number>} planeNormal - The perpendicular face of the plane
     * @param {Array<number>} planePoint - A point resting on the plane
     * @returns {number|null} Distance t, or null if parallel
     */
    static intersectPlane(origin, dir, planeNormal, planePoint) {
        const denom = this.dot(dir, planeNormal);
        if (Math.abs(denom) < 1e-6) return null; // Ray is parallel to the plane!
        
        const diff = this.sub(planePoint, origin);
        const t = this.dot(diff, planeNormal) / denom;
        
        return t >= 0 ? t : null;
    }
}
