
// B"H
/**
 * @file unprojector.js
 * @brief The bridge between the Clip-Space shadow and the World-Space truth.
 * 
 * THE TRACTATE OF THE REVERSED EMANATION:
 * The light descended through the matrices of form,
 * Now we reverse the flow, through the silence and the storm!
 * We take the point on the near plane, and the point on the far,
 * Finding exactly where in the infinite the user's intentions are!
 */

import { mat4_core } from '../../../math/mat4/core.js';
import { Vec3 } from '../../../math/vec3.js';

export class Unprojector {
    /**
     * B"H - Pulls a clip-space coordinate back into the physical world.
     * 
     * @param {number} nx - Normalized X.
     * @param {number} ny - Normalized Y.
     * @param {Float32Array} invVP - The Inverse View-Projection Matrix.
     * @returns {Array<number>} [x, y, z] in World Space.
     */
    static clipToWorld(nx, ny, nz, invVP) {
        const out = [0, 0, 0];
        mat4_core.transformPoint(out, [nx, ny, nz], invVP);
        return out;
    }

    /**
     * B"H - Combines and Inverts the perception matrices.
     * 
     * @param {Float32Array} proj - Projection Matrix.
     * @param {Float32Array} view - View Matrix.
     * @returns {Float32Array|null} The holy inverse, or null if the reality is crushed.
     */
    static getInverseVP(proj, view) {
        const vp = mat4_core.identity();
        mat4_core.multiply(vp, proj, view);
        
        const invVP = mat4_core.identity();
        if (!mat4_core.inverse(invVP, vp)) return null;
        return invVP;
    }
}
