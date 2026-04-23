
// B"H
/**
 * @file rayForgeMaster.js
 * @brief Orchestrating the modular unprojection pipeline.
 *
 * CHAPTER CCXLIX: THE PURITY RESTORED
 *
 * With the matrices finally auto-corrected from their swapped state, the math is 
 * simple and beautiful again. We invert the true View, and the true Projection.
 * The Ray's origin is exactly the translation of the inverted View matrix.
 * The Ray's destination is the screen click pushed to the Far Horizon.
 */

import { InversionVault } from '../matrices/logic/inversionVault.js';
import { Ray } from '../../../ray.js';
import { mat4_core } from '../../../../../math/mat4/core.js';
import { Vec3 } from '../../../../../math/vec3.js';

export class RayForgeMaster {
    /**
     * B"H - Forges a 3D Ray from NDC X,Y, Matrices, and the Camera itself.
     */
    static forge(nx, ny, proj, view, camera) {
        if (!proj || !view) {
            console.error(`B"H - RayForgeMaster: Matrices are void!`);
            return new Ray([0, 0, 0], [0, 0, -1]);
        }

        const invProj = InversionVault.getInverse(proj);
        const invView = InversionVault.getInverse(view);

        if (!invProj || !invView) {
            console.error(`B"H - RayForgeMaster: Matrix inversion failed!`);
            return new Ray([0, 0, 0], [0, 0, -1]);
        }

        // 1. The True Origin is simply the translation column of the True Inverse View Matrix
        const origin = [invView[12], invView[13], invView[14]];

        // 2. Transform the 2D Screen Click into 3D View Space (Targeting the Far Horizon, Z = 1.0)
        const viewPt = mat4_core.transformPoint([], [nx, ny, 1.0], invProj);

        // 3. Transform the View Space point out into absolute World Space
        const farWorld = mat4_core.transformPoint([], viewPt, invView);

        // 4. The Direction is the normalized vector from the Origin to the Far Horizon
        const direction = Vec3.normalize(Vec3.sub(farWorld, origin));

        return new Ray(origin, direction);
    }
}
