// B"H
/**
 * @file visuals.js
 * @description
 * Chapter 2: The Untouched Cloak.
 *
 * The Chossid player receives the same chossid.glb as NPCs through the same
 * loader path. This module refuses to repaint, hide, scale, remap, or dress
 * the GLB. The capsule moves; the GLB follows as pure visible form.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    minimapPos: false,
    lastPos: new THREE.Vector3(),

    /**
     * Disabled minimap shader bridge retained as a safe no-op.
     * @returns {void}
     */
    postProcessing() {
        return;
    },

    /**
     * Disabled depth-of-field adjustment retained as a safe no-op.
     * @returns {void}
     */
    adjustDOF() {
        return;
    },

    /**
     * Player GLB appearance is immutable after loading.
     * @returns {void}
     */
    updateAppearance() {
        return;
    },

    /**
     * Player GLB randomization is forbidden; NPCs may randomize elsewhere.
     * @returns {void}
     */
    randomizeAppearance() {
        return;
    }
};
