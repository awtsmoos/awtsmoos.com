
// B"H
/**
 * @file bounds.js
 * @brief Derives the physical bounds of a geometry from its raw vertices.
 * 
 * THE PSALM OF THE DEFINED LIMIT:
 * A sphere is fast, but an Axis-Aligned Box is exact!
 * We iterate the vertices, seeking the highest high and the lowest low,
 * Generating a box that perfectly hugs the creation in its local slumber.
 * We add a tiny epsilon of grace to the box, ensuring that a ray striking
 * the very mathematical edge is not lost to floating-point nothingness!
 */

import { Vec3 } from '../../math/vec3.js';

export class BoundingVolume {
    /**
     * B"H - Computes precise local bounds from a flat array of vertex positions.
     * @param {Float32Array|Array<number>} positions - Flat [x,y,z, x,y,z...]
     * @returns {Object} { min, max, center, radius }
     */
    static compute(positions) {
        if (!positions || positions.length === 0) {
            return { min: [-0.5,-0.5,-0.5], max: [0.5,0.5,0.5], center: [0,0,0], radius: 1.0 };
        }

        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            const z = positions[i+2];

            if (x < min[0]) min[0] = x;
            if (y < min[1]) min[1] = y;
            if (z < min[2]) min[2] = z;
            
            if (x > max[0]) max[0] = x;
            if (y > max[1]) max[1] = y;
            if (z > max[2]) max[2] = z;
        }

        // B"H - The Grace Epsilon: Expands the box infinitesimally to catch flat-face clicks
        const epsilon = 0.05;
        min[0] -= epsilon; min[1] -= epsilon; min[2] -= epsilon;
        max[0] += epsilon; max[1] += epsilon; max[2] += epsilon;

        const center = [
            (min[0] + max[0]) / 2.0,
            (min[1] + max[1]) / 2.0,
            (min[2] + max[2]) / 2.0
        ];

        const radius = Vec3.dist(center, max);

        return { min, max, center, radius };
    }
}
