
// B"H
/**
 * @file compositionForge.js
 * @brief Fusing two dimensions into one perspective.
 */

import { mat4_core } from '../../../../../../math/mat4/core.js';

export class CompositionForge {
    /**
     * B"H - Multiplies Proj by View to create the View-Projection vessel.
     */
    static forgeVP(proj, view) {
        const vp = new Float32Array(16);
        mat4_core.multiply(vp, proj, view);
        return vp;
    }
}
