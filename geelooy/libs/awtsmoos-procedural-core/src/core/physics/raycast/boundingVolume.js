
// B"H
/**
 * @file boundingVolume.js
 * @brief Derives the physical bounds of a geometry from its raw vertices.
 * 
 * THE PSALM OF THE DEFINED LIMIT:
 * The Kli (Vessel) must have limits to hold the Ohr (Light).
 * Without a boundary, the form vanishes into the night!
 * We iterate the vertices, seeking the highest high and the lowest low,
 * Finding the exact center where the essence begins to flow.
 * Then we measure the furthest spark from that central core,
 * Creating a sphere of safety that encompasses all and more.
 */

export class BoundingVolume {
    /**
     * B"H - Computes a precise bounding sphere from a flat array of vertex positions.
     * @param {Float32Array|Array<number>} positions - The flat [x,y,z, x,y,z...] array.
     * @returns {Object} An object containing { center: [x,y,z], radius: number }.
     */
    static computeSphere(positions) {
        if (!positions || positions.length === 0) {
            return { center: [0, 0, 0], radius: 1.0 };
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        // 1. Find the Axis-Aligned Extents
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            const z = positions[i+2];

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
        }

        // 2. Determine the Geometric Center
        const center = [
            (minX + maxX) / 2.0,
            (minY + maxY) / 2.0,
            (minZ + maxZ) / 2.0
        ];

        // 3. Find the Maximum Distance from the Center to any Vertex
        let maxDistSq = 0;
        for (let i = 0; i < positions.length; i += 3) {
            const dx = positions[i] - center[0];
            const dy = positions[i+1] - center[1];
            const dz = positions[i+2] - center[2];
            
            const distSq = dx*dx + dy*dy + dz*dz;
            if (distSq > maxDistSq) {
                maxDistSq = distSq;
            }
        }

        return {
            center: center,
            radius: Math.sqrt(maxDistSq)
        };
    }
}
