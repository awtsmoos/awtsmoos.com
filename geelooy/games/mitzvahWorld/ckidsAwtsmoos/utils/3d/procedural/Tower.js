
/**
 * B"H
 * @module Tower
 * @description
 * An outpost stretching towards the sky. Merges a cylindrical shaft with a conical roof.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Tower {
    /**
     * @function generate
     * @param {number} radius - The width of the tower.
     * @param {number} height - The height of the shaft.
     * @returns {THREE.BufferGeometry}
     */
    static generate(radius = 3, height = 15) {
        const shaft = new THREE.CylinderGeometry(radius * 0.8, radius, height, 16);
        shaft.translate(0, height / 2, 0);
        
        const roofHeight = radius * 2.5;
        const roof = new THREE.ConeGeometry(radius * 1.2, roofHeight, 16);
        roof.translate(0, height + roofHeight / 2, 0);
        
        const merged = BufferGeometryUtils.mergeGeometries([shaft, roof]);
        merged.computeBoundingBox();
        return merged;
    }
}
