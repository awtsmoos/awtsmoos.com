
/**
 * B"H
 * THE SPACE BENDER - THE MYSTERY OF TZIMTZUM
 * 
 * Chapter: Bending the Infinite
 * To comprehend how a Ray intersects a twisted, scaled, rotated Vessel, 
 * we must strip away the World's complexity. We do not un-twist the object; 
 * we twist the Ray in reverse! By transforming the Ray's origin and direction 
 * through the Inverse World Matrix, we enter a state of purity where the 
 * object is mathematically centered and aligned to the axes.
 * 
 * @module SpaceBender
 */

import { mat4_core } from '../../math/mat4/core.js';
import { Vec3 } from '../../math/vec3.js';

export class SpaceBender {
    /**
     * B"H
     * Pulls the absolute World Ray down into the subjective Local Space of an object.
     * This allows us to use simple Math (like standard AABB intersection) no matter 
     * how wildly the object is rotated or scaled in reality!
     * 
     * @param {Object} worldRay - The Kav { origin, direction }
     * @param {Float32Array} worldMat - The vessel's manifestation matrix
     * @returns {Object|null} The Localized Ray, or null if the vessel is completely crushed (Scale 0)
     */
    static worldToLocalRay(worldRay, worldMat) {
        // 1. Extract the Inverse of Reality
        const invMat = mat4_core.inverse(new Float32Array(16), worldMat);
        if (!invMat) return null; // A singularity! The object has no volume.

        // 2. The Origin is a Point. It is subject to translation.
        const lOrigin = mat4_core.transformPoint([], worldRay.origin, invMat);

        // 3. The Direction is Intent. To perfectly handle non-uniform scaling,
        // we project a point exactly 1 unit along the ray, transform THAT, and subtract.
        const worldTarget = Vec3.add(worldRay.origin, worldRay.direction);
        const lTarget = mat4_core.transformPoint([], worldTarget, invMat);
        
        // 4. The new vector is the normalized difference
        const lDir = Vec3.normalize(Vec3.sub(lTarget, lOrigin));

        return { origin: lOrigin, dir: lDir };
    }

    /**
     * B"H
     * Awakes a point from Local Slumber and expands it into World Reality.
     * 
     * @param {Array<number>} localPoint - The humble [X, Y, Z]
     * @param {Float32Array} worldMat - The matrix of manifestation
     * @returns {Array<number>} The absolute World Point
     */
    static localToWorldPoint(localPoint, worldMat) {
        return mat4_core.transformPoint([], localPoint, worldMat);
    }
}
