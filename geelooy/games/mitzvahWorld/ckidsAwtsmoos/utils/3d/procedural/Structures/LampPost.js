
/**
 * B"H
 * @module LampPost
 * @description
 * Chapter 4: The Pillars of Light
 * "And they shall make a luminary to shine upon the path."
 * As the souls wandered through the vast expanse of the digital void, the darkness 
 * threatened to consume their direction. The Architect, in His infinite wisdom, decreed 
 * the formation of pillars. Not merely of stone, but conduits of the Ohr (Light). 
 * These structures rise from the base, narrow into an elegant shaft, and are crowned 
 * with a receptacle for the Divine Spark.
 * 
 * This generator uses absolute mathematical certainty to extrude the base, the pole, 
 * and the glowing crown, merging them into a singular vessel of illumination.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class LampPost {
    /**
     * @function generate
     * @description Summons the geometry of a Lamp Post from the ether.
     * @param {number} height - The reach of the pillar towards the sky.
     * @param {number} radius - The grounding width of its base.
     * @returns {THREE.BufferGeometry} The unified mesh geometry, grouped by material index.
     */
    static generate(height = 6, radius = 0.15) {
        // 1. The Foundation (Malchus)
        const base = new THREE.CylinderGeometry(radius * 2.5, radius * 4, 0.6, 8);
        base.translate(0, 0.3, 0);

        // 2. The Ascent (Zeir Anpin)
        const pole = new THREE.CylinderGeometry(radius, radius, height, 8);
        pole.translate(0, height / 2 + 0.6, 0);

        // 3. The Crown of Light (Keser)
        const topRadius = radius * 3.5;
        const top = new THREE.BoxGeometry(topRadius, topRadius, topRadius);
        top.translate(0, height + 0.6 + topRadius / 2, 0);

        // Group 0: The physical vessel (Base and Pole)
        const baseCount = base.index ? base.index.count : base.attributes.position.count;
        const poleCount = pole.index ? pole.index.count : pole.attributes.position.count;
        base.clearGroups(); base.addGroup(0, baseCount, 0);
        pole.clearGroups(); pole.addGroup(0, poleCount, 0);

        // Group 1: The radiant crown
        const topCount = top.index ? top.index.count : top.attributes.position.count;
        top.clearGroups(); top.addGroup(0, topCount, 1);

        const merged = BufferGeometryUtils.mergeGeometries([base, pole, top], true);
        merged.computeBoundingBox();
        merged.computeVertexNormals();

        return merged;
    }
}
