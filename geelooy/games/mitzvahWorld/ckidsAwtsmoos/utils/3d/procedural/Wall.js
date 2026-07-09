
/**
 * B"H
 * @module Wall
 * @description
 * A barrier of separation, dividing the sacred from the mundane.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Wall {
    /**
     * @function generate
     * @param {number} width - The span of the wall.
     * @param {number} height - The height of the wall.
     * @param {number} thickness - The depth of the wall.
     * @returns {THREE.BufferGeometry}
     */
    static generate(width = 10, height = 5, thickness = 1) {
        const geo = new THREE.BoxGeometry(width, height, thickness);
        geo.translate(0, height / 2, 0); // Rest the base at y=0
        geo.computeBoundingBox();
        return geo;
    }
}
