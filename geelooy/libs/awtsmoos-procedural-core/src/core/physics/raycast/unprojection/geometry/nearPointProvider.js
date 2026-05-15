
// B"H
/**
 * @file nearPointProvider.js
 * @brief Finding the Source of Light at the screen's surface.
 */

import { PointExpander } from '../spatial/pointExpander.js';

export class NearPointProvider {
    /**
     * B"H - Finds the world-space coordinate of an NDC point on the Near Plane (Z=-1).
     */
    static getNear(nx, ny, invVP) {
        return PointExpander.expand(nx, ny, -1.0, invVP);
    }
}
