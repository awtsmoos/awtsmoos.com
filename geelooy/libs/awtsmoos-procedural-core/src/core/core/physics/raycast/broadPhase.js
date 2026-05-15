
/**
 * B"H
 * THE OUTER GUARDS (BROADPHASE)
 * 
 * Chapter: The Gatekeepers of Tzimtzum
 * Why expend the computational effort of the heavens to check thousands of triangles, 
 * when we can merely ask the Outer Aura (the AABB) if the Light has touched it? 
 * This module leverages the profound perfection of Local Space intersection.
 * 
 * @module BroadphaseChecker
 */

import { Intersections } from './intersections.js';

export class BroadphaseChecker {
    /**
     * B"H
     * Swiftly determines if the Local Ray breaches the Local Bounds.
     * 
     * @param {Array<number>} localOrigin - Ray source (already contracted to object space)
     * @param {Array<number>} localDir - Ray trajectory
     * @param {Object} bounds - The {min, max} limits of the geometry
     * @returns {number} The distance 't', or Infinity if completely missed
     */
    static testAABB(localOrigin, localDir, bounds) {
        if (!bounds || !bounds.min || !bounds.max) return Infinity;
        
        const t = Intersections.rayAABB(localOrigin, localDir, bounds.min, bounds.max);
        return t !== null ? t : Infinity;
    }
}
