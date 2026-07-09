
/**
 * B"H
 * @module Arch
 * @description
 * A gateway between realms. The arch represents the bending of the strict line of judgment (Gevurah)
 * into a bridge of mercy (Chesed). It stands upon two solid pillars, holding up the curve of the heavens.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Arch {
    /**
     * @function generate
     * @description Extrudes the mathematical concept of an archway.
     * @param {number} width - The span of the gate.
     * @param {number} height - The total elevation.
     * @param {number} depth - The thickness of the threshold.
     * @returns {THREE.BufferGeometry}
     */
    static generate(width = 4, height = 5, depth = 1) {
        const pillarRadius = depth / 2;
        const pillarHeight = height - (width / 2); 

        const leftPillar = new THREE.BoxGeometry(pillarRadius * 2, pillarHeight, depth);
        leftPillar.translate(-width / 2 + pillarRadius, pillarHeight / 2, 0);

        const rightPillar = new THREE.BoxGeometry(pillarRadius * 2, pillarHeight, depth);
        rightPillar.translate(width / 2 - pillarRadius, pillarHeight / 2, 0);

        const archRadius = (width / 2) - pillarRadius;
        const archTube = pillarRadius;
        const arch = new THREE.TorusGeometry(archRadius, archTube, 16, 32, Math.PI);
        
        arch.rotateZ(Math.PI); 
        arch.translate(0, pillarHeight, 0);

        const merged = BufferGeometryUtils.mergeGeometries([leftPillar, rightPillar, arch]);
        merged.computeBoundingBox();
        return merged;
    }
}
