// B"H
/**
 * @file visuals.js
 * @description
 * Chapter 2: The Cloak Returned To The Living Vessel.
 *
 * The player keeps the capsule collider as the body of motion, while
 * chossid.glb stays the visible garment riding above it. This module delegates
 * garment visibility to a small helper and leaves the collider untouched.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { applyPlayerGarments } from './visuals/garments.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    minimapPos: false,
    lastPos: new THREE.Vector3(),

    /** @returns {void} Retained as a no-op shader hook. */
    postProcessing() { return; },

    /** @returns {void} Retained as a no-op camera hook. */
    adjustDOF() { return; },

    /**
     * Reveals equipped or data-defined clothes on the player GLB.
     *
     * @returns {void}
     */
    updateAppearance() {
        applyPlayerGarments(this);
    },

    /**
     * Keeps the player deterministic; inventory and explicit clothes drive style.
     *
     * @returns {void}
     */
    randomizeAppearance() { return; }
};
