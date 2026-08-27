
// B"H
/**
 * @file directionCalculus.js
 * @brief Forming the arrow of momentum.
 */

import { Vec3 } from '../../../../math/vec3.js';

export class DirectionCalculus {
    /**
     * B"H - Computes the normalized direction from start to end.
     */
    static getDirection(start, end) {
        const diff = Vec3.sub(end, start);
        return Vec3.normalize(diff);
    }
}
