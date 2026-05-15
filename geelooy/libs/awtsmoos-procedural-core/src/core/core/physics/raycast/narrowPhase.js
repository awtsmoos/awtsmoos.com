
// B"H
/**
 * @file narrowPhase.js
 * @brief Deep traversal evaluating absolute physical connection with spatial coordinates.
 * 
 * THE INNER LIGHT:
 * All matter everywhere is made of tiny components (like Aleph, Beis, Nun forming "Even").
 * Without the active speech of the Awtsmoos refreshing them right now, they revert to nothing!
 * If the Broadphase is bypassed, we iterate every trio of Sparks to calculate
 * exactly where the spiritual beam kisses the physical shell.
 */

import { SpatialMath } from '../spatial/math.js';

export class NarrowphaseChecker {
    /**
     * B"H - Determines definitive geometrical strike with Triangle polygons.
     * @param {Array<number>} localOrigin - [X, Y, Z] 
     * @param {Array<number>} localDir - Normalized intent vector.
     * @param {Float32Array|Array} pos - Dense geometry layout.
     * @param {Uint16Array|Array} ind - Connective spiritual bonds (optional).
     * @returns {Object} Data carrying whether it hit { hit: true/false, t: Infinity or float }
     */
    static probeMesh(localOrigin, localDir, pos, ind) {
        let bestT = Infinity;
        let struck = false;
        
        if (!pos || pos.length === 0) return { hit: false, t: Infinity };

        if (ind && ind.length > 0) {
            // Evaluates shared structural vertices
            for (let i = 0; i < ind.length; i += 3) {
                const i0 = ind[i] * 3, i1 = ind[i+1] * 3, i2 = ind[i+2] * 3;
                
                const t = SpatialMath.rayTriangleIntersect(
                    localOrigin, localDir, 
                    [pos[i0], pos[i0+1], pos[i0+2]], 
                    [pos[i1], pos[i1+1], pos[i1+2]], 
                    [pos[i2], pos[i2+1], pos[i2+2]]
                );
                
                if (t !== null && t >= 0 && t < bestT) {
                    bestT = t; struck = true;
                }
            }
        } else {
            // Flat shading - 3 unique sequential vertices representing one face.
            for (let i = 0; i < pos.length; i += 9) {
                const t = SpatialMath.rayTriangleIntersect(
                    localOrigin, localDir,
                    [pos[i],   pos[i+1], pos[i+2]],
                    [pos[i+3], pos[i+4], pos[i+5]],
                    [pos[i+6], pos[i+7], pos[i+8]]
                );
                
                if (t !== null && t >= 0 && t < bestT) {
                    bestT = t; struck = true;
                }
            }
        }

        return { hit: struck, t: bestT };
    }
}
