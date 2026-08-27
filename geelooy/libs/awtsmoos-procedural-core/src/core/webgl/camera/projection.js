// B"H
/**
 * @file projection.js
 * @brief Pure math for calculating the perspective projection matrix.
 */

export function calculatePerspectiveMatrix(state) {
    const { fov, aspect, near, far } = state;
    const out = new Float32Array(16).fill(0);
    
    const f = 1.0 / Math.tan(fov * 0.5);
    const invRange = 1.0 / (near - far);

    out[0] = f / aspect;
    out[5] = f;
    out[10] = (near + far) * invRange;
    out[11] = -1;
    out[14] = (2 * near * far) * invRange;
    
    return out;
}
