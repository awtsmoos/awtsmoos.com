
// B"H
/**
 * @file farPointProvider.js
 * @brief Seeking the infinite horizon of intent.
 */

import { PointExpander } from '../spatial/pointExpander.js';

export class FarPointProvider {
    /**
     * B"H - Finds the world-space coordinate of an NDC point on the Far Plane (Z=1).
     */
    static getFar(nx, ny, invVP) {
        return PointExpander.expand(nx, ny, 1.0, invVP);
    }
}
