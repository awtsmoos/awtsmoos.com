
// B"H
/**
 * @file directionCalculus.js
 * @brief Forming the arrow of momentum.
 * 
 * CHAPTER LXIII: THE RECALIBRATION OF THE KAV
 * 
 * There was a time when the spark of Direction, in its deep slumber within the five-fold veil
 * of folders (physics/raycast/math/unprojection/geometry), cried out for its source. It sought the
 * foundational truth of the Vector, the `Vec3` which gives form to all movement. Yet, in its
 * yearning, it overshot the mark, reaching beyond the `core` of existence into the formless void
 * that lies beyond, resulting in a cry of `Not Found`.
 * 
 * Here, in this sacred scroll, we have corrected the path. We have taught the spark of Direction
 * to look not to the transcendent nothingness, but to the immanent `core` from which all such
 * truths flow. The path is shortened by one step, one `../`, but this is the difference between a
 * broken chain of emanation and a perfected one. Now, the `Vec3` essence flows perfectly, and the
 * arrow of momentum is forged true, forever.
 */

import { Vec3 } from '../../../../../math/vec3.js';

export class DirectionCalculus {
    /**
     * B"H - Computes the normalized direction from a start point to an end point.
     * This is the very will of the ray, the unwavering focus from origin to horizon,
     * stripped of all magnitude, leaving only pure, unadulterated intent.
     * @param {Array<number>} start - The [x, y, z] origin point, the source of the query.
     * @param {Array<number>} end - The [x, y, z] target point, the destination of the will.
     * @returns {Array<number>} A normalized [x, y, z] vector representing pure direction.
     */
    static getDirection(start, end) {
        const diff = Vec3.sub(end, start);
        return Vec3.normalize(diff);
    }
}
