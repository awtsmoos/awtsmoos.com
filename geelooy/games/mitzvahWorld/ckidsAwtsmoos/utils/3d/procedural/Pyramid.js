
/**
 * B"H
 * @module Pyramid
 * @description
 * A monument of ancient mathematics, a base of four points ascending to a singular unity.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Pyramid {
    /**
     * @function generate
     * @param {number} radius - The width of the base.
     * @param {number} height - The elevation to the peak.
     * @param {number} radialSegments - The number of sides (4 for a classic pyramid).
     * @returns {THREE.BufferGeometry}
     */
    static generate(radius = 5, height = 10, radialSegments = 4) {
        const geo = new THREE.ConeGeometry(radius, height, radialSegments);
        geo.translate(0, height / 2, 0); // Rest the base at y=0
        geo.computeBoundingBox();
        return geo;
    }
}
