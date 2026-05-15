// B"H
/**
 * @file transformations.js
 * @brief This module provides functions for applying common transformations
 *        (translation, rotation, scaling) to 4x4 matrices.
 */

export const mat4_transformations = {
    translate: (m, v) => {
        let x = v[0], y = v[1], z = v[2];
        let m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        let m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        let m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        let m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

        m[12] = m00 * x + m10 * y + m20 * z + m30;
        m[13] = m01 * x + m11 * y + m21 * z + m31;
        m[14] = m02 * x + m12 * y + m22 * z + m32;
        m[15] = m03 * x + m13 * y + m23 * z + m33;
        return m;
    },

    rotateX: (m, angle) => {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];

        m[4] = m10 * c + m20 * s;
        m[5] = m11 * c + m21 * s;
        m[6] = m12 * c + m22 * s;
        m[7] = m13 * c + m23 * s;

        m[8] = m20 * c - m10 * s;
        m[9] = m21 * c - m11 * s;
        m[10] = m22 * c - m12 * s;
        m[11] = m23 * c - m13 * s;
        return m;
    },

    rotateY: (m, angle) => {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];

        m[0] = m00 * c - m20 * s;
        m[1] = m01 * c - m21 * s;
        m[2] = m02 * c - m22 * s;
        m[3] = m03 * c - m23 * s;

        m[8] = m00 * s + m20 * c;
        m[9] = m01 * s + m21 * c;
        m[10] = m02 * s + m22 * c;
        m[11] = m03 * s + m23 * c;
        return m;
    },

    rotateZ: (m, angle) => {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];

        m[0] = m00 * c + m10 * s;
        m[1] = m01 * c + m11 * s;
        m[2] = m02 * c + m12 * s;
        m[3] = m03 * c + m13 * s;

        m[4] = m10 * c - m00 * s;
        m[5] = m11 * c - m01 * s;
        m[6] = m12 * c - m02 * s;
        m[7] = m13 * c - m03 * s;
        return m;
    },

    scale: (m, v) => {
        let x = v[0], y = v[1], z = v[2];
        m[0] *= x; m[1] *= x; m[2] *= x; m[3] *= x;
        m[4] *= y; m[5] *= y; m[6] *= y; m[7] *= y;
        m[8] *= z; m[9] *= z; m[10] *= z; m[11] *= z;
        return m;
    }
};