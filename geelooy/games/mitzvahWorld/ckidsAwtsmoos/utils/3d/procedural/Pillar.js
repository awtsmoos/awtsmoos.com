
/**
 * B"H
 * @module Pillar
 * @description
 * "The pillars of the earth are the Lord's, and He has set the world upon them." (Shmuel 1 2:8)
 * This module draws down the geometric concept of a supporting column, 
 * fusing a firm base, an ascending shaft, and a crowning capital into a single, unified mesh.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Pillar {
    /**
     * @function generate
     * @description Forges a pillar out of raw numerical data.
     * @param {number} radius - The spiritual thickness of the pillar.
     * @param {number} height - The reach towards the heavens.
     * @returns {THREE.BufferGeometry} The consolidated geometry.
     */
    static generate(radius = 0.5, height = 5) {
        const baseH = 0.4;
        const capH = 0.4;
        const shaftH = height - (baseH + capH);

        const base = new THREE.BoxGeometry(radius * 3, baseH, radius * 3);
        base.translate(0, baseH / 2, 0);

        const shaft = new THREE.CylinderGeometry(radius * 0.8, radius, shaftH, 16);
        shaft.translate(0, baseH + shaftH / 2, 0);

        const capital = new THREE.CylinderGeometry(radius * 1.5, radius * 0.8, capH, 16);
        capital.translate(0, baseH + shaftH + capH / 2, 0);

        const merged = BufferGeometryUtils.mergeGeometries([base, shaft, capital]);
        merged.computeBoundingBox();
        return merged;
    }
}
