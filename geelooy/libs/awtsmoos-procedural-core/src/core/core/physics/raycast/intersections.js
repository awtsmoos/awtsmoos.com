
/**
 * B"H
 * THE CRUCIBLE OF INTERSECTION
 * 
 * Chapter: The Box and The Line
 * Here, the mathematical purity of geometry is tested.
 * We determine exactly at what distance 't' the Ray of Light pierces 
 * the rigid boundaries of the Vessel. If the Ray originates INSIDE 
 * the vessel, the vessel is immediately illuminated (t=0)!
 * 
 * @module Intersections
 */

export class Intersections {
    /**
     * B"H
     * Evaluates the piercing of an Axis-Aligned Bounding Box (AABB).
     * Works flawlessly in Local Space.
     * 
     * @param {Array<number>} origin - The Ray Origin
     * @param {Array<number>} dir - The Normalized Intent
     * @param {Array<number>} min - The Lowest Extremity of the Box
     * @param {Array<number>} max - The Highest Extremity of the Box
     * @returns {number|null} The distance 't' of impact, or null if it misses
     */
    static rayAABB(origin, dir, min, max) {
        let tmin = -Infinity, tmax = Infinity;

        for (let i = 0; i < 3; i++) {
            if (Math.abs(dir[i]) < 1e-7) {
                // Ray is parallel to the slab. Is it outside the boundaries?
                if (origin[i] < min[i] || origin[i] > max[i]) return null;
            } else {
                const invD = 1.0 / dir[i];
                let t0 = (min[i] - origin[i]) * invD;
                let t1 = (max[i] - origin[i]) * invD;

                if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp; }
                
                tmin = Math.max(tmin, t0);
                tmax = Math.min(tmax, t1);
                
                if (tmax < tmin) return null; // Missed the box entirely
            }
        }

        if (tmax < 0) return null; // Box is entirely behind the Ray

        // If tmin is negative, the Ray started INSIDE the box! We hit immediately at t=0.
        return Math.max(tmin, 0);
    }
}
