
/**
 * B"H
 * @module CloudAssembler
 * @description
 * Clouds that drift across the firmament. Merges several spheres into a single, 
 * puffy BufferGeometry to create the illusion of soft atmosphere.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class CloudAssembler {
    /**
     * @function generate
     * @description Assembles a cluster of spheres into a cloud.
     */
    static generate(size = 10, puffiness = 5) {
        try {
            const puffs = [];
            for(let i = 0; i < puffiness; i++) {
                const puff = new THREE.SphereGeometry(size * (0.5 + Math.random() * 0.5), 16, 12);
                puff.translate(
                    (Math.random() - 0.5) * size * 2,
                    (Math.random() - 0.5) * size * 0.5,
                    (Math.random() - 0.5) * size * 2
                );
                puffs.push(puff);
            }
            return BufferGeometryUtils.mergeGeometries(puffs);
        } catch (e) {
            console.error("B\"H - ⚡ Cloud weaving failed.", e);
            return new THREE.BoxGeometry(1, 1, 1);
        }
    }
}
