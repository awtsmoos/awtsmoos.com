
// B"H
/**
 * @file bezier.js
 * @brief Utilities for calculating points on Bezier curves.
 */

import { Vec3 } from './vec3.js';

export const Bezier = {
    /**
     * Calculates a point on a Cubic Bezier curve at time t.
     * Formula: (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t)t^2 P2 + t^3 P3
     */
    cubic: (t, p0, p1, p2, p3) => {
        const oneMinusT = 1.0 - t;
        const oneMinusT2 = oneMinusT * oneMinusT;
        const oneMinusT3 = oneMinusT2 * oneMinusT;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = oneMinusT3 * p0[0] + 3 * oneMinusT2 * t * p1[0] + 3 * oneMinusT * t2 * p2[0] + t3 * p3[0];
        const y = oneMinusT3 * p0[1] + 3 * oneMinusT2 * t * p1[1] + 3 * oneMinusT * t2 * p2[1] + t3 * p3[1];
        const z = oneMinusT3 * p0[2] + 3 * oneMinusT2 * t * p1[2] + 3 * oneMinusT * t2 * p2[2] + t3 * p3[2];

        return [x, y, z];
    },

    /**
     * B"H - Generates a sequence of points from a list of cubic Bezier control points.
     * @param {Array} points - List of points [p0, p1, p2, p3, p4, p5, p6...] where p3=p4 etc.
     * @param {number} segments - Subdivisions per curve segment.
     */
    generatePath: (points, segments) => {
        if (!points || points.length < 4) return points || [];
        const path = [];
        for (let i = 0; i < points.length - 1; i += 3) {
            const p0 = points[i], p1 = points[i+1], p2 = points[i+2], p3 = points[i+3];
            if (!p1 || !p2 || !p3) break;
            
            // B"H - Only add the first point of the first segment.
            // Subsequent segments start with the last point of the previous segment.
            const startJ = (i === 0) ? 0 : 1; 
            for (let j = startJ; j <= segments; j++) {
                path.push(Bezier.cubic(j / segments, p0, p1, p2, p3));
            }
        }
        return path;
    }
};
