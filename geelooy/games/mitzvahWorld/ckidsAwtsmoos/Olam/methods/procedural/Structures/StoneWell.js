
/**
 * B"H
 * @module StoneWell
 * @description
 * "And he saw, and behold, a well in the field..." (Bereishit 29:2)
 * Forges an ancient stone well by merging a cylindrical pit with a tiled roof. 
 * A place where the living waters are found.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class StoneWell {
    /**
     * @function generate
     */
    static generate(radius = 3, height = 2) {
        try {
            // 1. The Basin
            const basin = new THREE.CylinderGeometry(radius, radius, height, 16, 1, true);
            basin.translate(0, height / 2, 0);

            // 2. The Inner Lining
            const inner = new THREE.CylinderGeometry(radius - 0.5, radius - 0.5, height, 16, 1, true);
            inner.translate(0, height / 2, 0);
            
            // 3. The Lip (Torus)
            const lip = new THREE.TorusGeometry(radius - 0.25, 0.4, 8, 16);
            lip.rotateX(Math.PI / 2);
            lip.translate(0, height, 0);

            const merged = BufferGeometryUtils.mergeGeometries([basin, inner, lip]);
            merged.computeBoundingBox();
            return merged;
        } catch (e) {
            console.error("B\"H - ⚡ Well formation shattered.", e);
            return new THREE.BoxGeometry(radius, height, radius);
        }
    }
}
