
// B"H
/**
 * @file compositionForge.js
 * @brief Uniting the King and the Minister.
 * 
 * THE PSALM OF UNITY:
 * Projection (The Decree) and View (The Perception),
 * United together to prevent all deception.
 * Clip = Proj * View, the standard of old,
 * In this golden vessel, the world is now rolled.
 */

import { mat4_core } from '../../../../math/mat4/core.js';

export class CompositionForge {
    /**
     * B"H - Unites Proj and View into a View-Projection matrix.
     */
    static forgeVP(proj, view) {
        const vp = new Float32Array(16);
        mat4_core.multiply(vp, proj, view);
        return vp;
    }
}
