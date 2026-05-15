
// B"H
/**
 * @file vec3.js
 * @brief Simple 3D vector operations for geometry processing.
 */

export const Vec3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (v, s) => [v[0] * s, v[1] * s, v[2] * s], // Scalar multiplication
    scale: (v, s) => [v[0] * s, v[1] * s, v[2] * s], // Alias for mul
    lerp: (a, b, t) => [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t
    ],
    cross: (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    normalize: (v) => {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
    },
    copy: (v) => [...v],
    average: (vectors) => {
        if (!vectors || vectors.length === 0) return [0, 0, 0];
        const sum = vectors.reduce((acc, v) => Vec3.add(acc, v), [0, 0, 0]);
        return Vec3.scale(sum, 1 / vectors.length);
    },
    // B"H - Check equality with epsilon
    equals: (a, b, epsilon = 1e-5) => {
        return Math.abs(a[0] - b[0]) < epsilon &&
               Math.abs(a[1] - b[1]) < epsilon &&
               Math.abs(a[2] - b[2]) < epsilon;
    },
    // B"H - Rotate vector v around axis by angle (radians) using Rodrigues' formula
    rotate: (v, axis, angle) => {
        const k = Vec3.normalize(axis);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // v_rot = v * cos + (k x v) * sin + k * (k . v) * (1-cos)
        const term1 = Vec3.scale(v, cos);
        const term2 = Vec3.scale(Vec3.cross(k, v), sin);
        const term3 = Vec3.scale(k, Vec3.dot(k, v) * (1 - cos));
        
        return Vec3.add(term1, Vec3.add(term2, term3));
    },
    distSq: (a, b) => {
        const x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2];
        return x * x + y * y + z * z;
    },
    dist: (a, b) => {
        return Math.sqrt(Vec3.distSq(a, b));
    }
};
