
// B"H
/**
 * @file spaceExpander.js
 * @brief Expands compressed NDC coordinates back into World Space.
 * 
 * THE ALCHEMY OF THE SPARK:
 * A pixel clicked on the screen is merely a shadow! It is bounded
 * between -1 and 1. It is trapped in the finite.
 * By passing it through the Inverse View-Projection Matrix, we free the
 * pixel! We grant it the 'W' homogenous weight, and we watch it expand
 * back into the true cosmic coordinate from whence its light originated.
 */

import { PointTransformer } from '../../../../math/mat4/transformations/pointTransformer.js';

export class SpaceExpander {
    /**
     * B"H - Casts a normalized coordinate through the portal of Inversion.
     * @param {number} nx - Normalized X (-1 to 1)
     * @param {number} ny - Normalized Y (-1 to 1)
     * @param {number} nz - Normalized Z (-1 for near, 1 for far)
     * @param {Float32Array} invVP - The shattered VP portal.
     * @returns {Array<number>} The absolute [x, y, z] coordinate.
     */
    static expand(nx, ny, nz, invVP) {
        const outPoint = [0, 0, 0];
        PointTransformer.transform(outPoint, [nx, ny, nz], invVP);
        return outPoint;
    }
}
