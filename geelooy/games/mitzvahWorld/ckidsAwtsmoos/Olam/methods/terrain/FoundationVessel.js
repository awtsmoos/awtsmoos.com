
// B"H
/**
 * @module FoundationVessel
 * @description
 * ⛰️ CHAPTER 1: THE GATHERING OF THE DUST ⛰️
 * 
 * "And G-d said: Let the waters be gathered... and let the dry land appear." (Bereishis 1:9)
 * 
 * To ensure the world is stable and that the soul (player) does not fall 
 * through an illusory zero-thickness surface, we manifest the ground as a 
 * thick Box. This provides physical mass (Gevurah) that the collision 
 * octree can digest with ease, preventing infinite mathematical recursions.
 * 
 * We only sculpt the Top Face, allowing the base to remain a firm, 
 * unchanging foundation.
 * 
 * @class FoundationVessel
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class FoundationVessel {
    /**
     * @function carve
     * @description Materializes the physical shape of the earth.
     * @param {Object} params - The dimensions of the ground.
     * @param {number} params.width
     * @param {number} params.depth
     * @param {number} params.thickness - The physical height of the box.
     * @param {number} params.segments - Detail level for the top face.
     * @param {Array} params.hills - Elevation points.
     * @returns {THREE.BufferGeometry} The resulting geometry.
     */
    static carve({ width, depth, thickness = 2.0, segments = 20, hills = [] }) {
        try {
            // B"H: silent


            // 1. Create a Box. The top face will be our walking surface.
            const geometry = new THREE.BoxGeometry(width, thickness, depth, segments, 1, segments);
            
            // 2. Proportional Sculpting
            // We only want to elevate the top vertices of the box.
            const pos = geometry.attributes.position;
            const topYValue = thickness / 2;
            const vertex = new THREE.Vector3();

            for (let i = 0; i < pos.count; i++) {
                vertex.fromBufferAttribute(pos, i);
                
                // B"H: If the vertex is at the top of the box (with a tiny epsilon for float precision)
                if (vertex.y > topYValue - 0.01) {
                    let addedHeight = 0;

                    // Apply the will of the hills to this specific point
                    for (const hill of hills) {
                        const dx = vertex.x - hill.x;
                        const dz = vertex.z - hill.z;
                        const dist = Math.sqrt(dx * dx + dz * dz);

                        if (dist < hill.radius) {
                            // Cosine Falloff ensures a smooth, organic slope
                            const falloff = 0.5 * (1 + Math.cos(Math.PI * dist / hill.radius));
                            addedHeight += hill.height * falloff;
                        }
                    }
                    
                    pos.setY(i, vertex.y + addedHeight);
                }
            }

            // 3. Final Manifestation Logic
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();

            return geometry;
        } catch (e) {
            console.error("B\"H - 🚨 FoundationVessel: The carving failed:", e);
            return new THREE.BoxGeometry(width, thickness, depth);
        }
    }

    /**
     * @function rectify
     * @description Lowers the entire mass so the top surface sits exactly at Y=0.
     * @param {THREE.Mesh} mesh - The ground mesh.
     * @param {number} thickness - How deep the foundation goes.
     */
    static rectify(mesh, thickness) {
        if (!mesh) return;
        // Shift center down by half the thickness
        mesh.position.y = -(thickness / 2);
    }
}
