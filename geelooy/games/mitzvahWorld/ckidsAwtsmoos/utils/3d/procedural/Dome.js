
/**
 * B"H
 * @module Dome
 * @description
 * "He stretches out the heavens like a canopy." (Yeshayahu 40:22)
 * The dome is the ultimate expression of Encompassing Light (Ohr Makif), 
 * shielding the inner space while reflecting the infinite curve of the sky above.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Dome {
    /**
     * @function generate
     * @description Manifests a perfect hemisphere.
     * @param {number} radius - The reach of the canopy.
     * @returns {THREE.BufferGeometry}
     */
    static generate(radius = 5) {
        const dome = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        dome.computeBoundingBox();
        return dome;
    }
}
