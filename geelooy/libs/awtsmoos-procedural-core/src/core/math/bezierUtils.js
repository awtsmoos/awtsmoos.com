
// B"H
/**
 * @file bezierUtils.js
 * @brief Utilities for generating points along Bezier curves.
 */

export class BezierUtils {
    /**
     * B"H - Generates points along a quadratic Bezier curve.
     * @param {Array} p0 - Start Point
     * @param {Array} p1 - Control Point (Determines the peak)
     * @param {Array} p2 - End Point
     * @param {number} segments - Number of divisions
     */
    static getPoints(p0, p1, p2, segments = 10) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const invT = 1.0 - t;
            
            // Formula: (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
            const x = invT * invT * p0[0] + 2 * invT * t * p1[0] + t * t * p2[0];
            const y = invT * invT * p0[1] + 2 * invT * t * p1[1] + t * t * p2[1];
            const z = invT * invT * p0[2] + 2 * invT * t * p1[2] + t * t * p2[2];
            
            points.push([x, y, z]);
        }
        return points;
    }
}
