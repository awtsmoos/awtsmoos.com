
/**
 * B"H
 * @module TerrainGeometryEmanator
 * @description
 * ⛰️ THE SHAPING OF THE MOUNTAINS ⛰️
 * 
 * "Before the mountains were born, or You brought forth the earth..." (Tehillim 90:2)
 * 
 * This module is absolutely severed from the rendering logic. It takes pure JSON 
 * data representing the 'hills' and mathematically displaces the vertices of a plane.
 * It also computes a massive bounding sphere so the GPU can safely frustum-cull.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import TerrainMath from './TerrainMath.js';

export default class TerrainGeometryEmanator {
    /**
     * @function emanate
     * @description Carves the plane into valleys and peaks.
     * @param {Object} data - The terrain blueprint.
     * @returns {THREE.PlaneGeometry}
     */
    static emanate(data) {
        const { width, depth, segments, hills } = data;
        
        const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
        geometry.rotateX(-Math.PI / 2); // Lay it flat

        if (hills && hills.length > 0) {
            const pos = geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const z = pos.getZ(i);
                
                // B"H: We delegate to the pure math module!
                const h = TerrainMath.calculateHeightAt(x, z, hills);
                pos.setY(i, h);
            }
            geometry.computeVertexNormals();
        }

        // B"H: THE SHIELD OF THE HORIZON
        // We set the bounding sphere massively large, covering the corners,
        // so it only culls when we truly turn away.
        geometry.computeBoundingSphere();
        const maxDim = Math.max(width, depth);
        geometry.boundingSphere.radius = maxDim * 0.75; 

        return geometry;
    }
}
