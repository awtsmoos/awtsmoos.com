
/**
 * B"H
 * @module Island
 * @description
 * "He hangs the earth upon nothing." (Iyov 26:7)
 * Generates floating islands of rock and earth that hover in the digital void.
 * The top is a flat plane for walking, while the bottom tapers into jagged, noisy peaks.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Island {
    /**
     * @function generate
     * @description Extrudes a floating island geometry.
     * @param {number} radius - The expanse of the island surface.
     * @param {number} depth - How deep the rocky roots extend into the void.
     * @returns {THREE.BufferGeometry}
     */
    static generate(radius = 30, depth = 20) {
        // We start with a cylinder that tapers to almost a point at the bottom
        const geo = new THREE.CylinderGeometry(radius, 1, depth, 32, 10);
        geo.translate(0, -depth / 2, 0); // Flat top is exactly at Y=0
        
        const pos = geo.attributes.position;

        // B"H: Carve the jagged roots with pure math
        for(let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            
            // Protect the flat walking surface (Y=0)
            if(y < -0.5) {
                // Intense random noise scaling based on depth
                // The deeper it goes, the more jagged it becomes
                const noise = (Math.random() * 2 - 1);
                const depthFactor = Math.abs(y / depth);
                
                pos.setX(i, pos.getX(i) + noise * depthFactor * 8);
                pos.setZ(i, pos.getZ(i) + noise * depthFactor * 8);
            }
        }

        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        return geo;
    }
}
