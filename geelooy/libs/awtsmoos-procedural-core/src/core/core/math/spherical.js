
// B"H
/**
 * @file spherical.js
 * @brief Standard Spherical Coordinate Mathematics.
 *        Y is Up. Theta is Azimuth (XZ plane). Phi is Polar (Angle from Y).
 */
export const Spherical = {
    /**
     * Converts spherical coordinates to a Cartesian vector.
     * @param {number} radius - Distance from origin.
     * @param {number} phi - Angle from positive Y axis (0 = Up, PI = Down).
     * @param {number} theta - Angle around Y axis (starts at Z).
     * @returns {Array} [x, y, z]
     */
    toCartesian: (radius, phi, theta) => {
        const sinPhi = Math.sin(phi);
        const x = radius * sinPhi * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * sinPhi * Math.cos(theta);
        return [x, y, z];
    },

    /**
     * Restricts phi to prevent gimbal lock (never exactly 0 or PI).
     */
    clampPhi: (phi) => {
        return Math.max(0.0001, Math.min(Math.PI - 0.0001, phi));
    }
};
