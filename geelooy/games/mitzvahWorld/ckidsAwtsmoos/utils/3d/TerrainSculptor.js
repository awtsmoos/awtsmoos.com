
/**
 * B"H
 * @module TerrainSculptor
 * @description
 * "Before the mountains were born, or You brought forth the earth..." (Tehillim 90:2)
 * This sacred instrument bends the flat plane of existence, raising mountains and 
 * carving valleys using proportional mathematical falloff, mirroring the gathering 
 * of the waters to let the dry land appear.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class TerrainSculptor {
    /**
     * @function sculpt
     * @description Elevates vertices based on proximity to defined spiritual centers (hills).
     * @param {THREE.BufferGeometry} geometry - The raw, flat earth.
     * @param {Array<{x: number, z: number, radius: number, height: number}>} hills - The decrees of elevation.
     */
    static sculpt(geometry, hills) {
        if (!geometry.attributes.position) return;

        const pos = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < pos.count; i++) {
            vertex.fromBufferAttribute(pos, i);
            let addedHeight = 0;

            for (const hill of hills) {
                const dx = vertex.x - hill.x;
                const dz = vertex.z - hill.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < hill.radius) {
                    // B"H: Cosine Falloff (Smoothstep interpolation)
                    // At center (dist=0), factor is 1. At edge (dist=radius), factor is 0.
                    const falloff = 0.5 * (1 + Math.cos(Math.PI * dist / hill.radius));
                    addedHeight += hill.height * falloff;
                }
            }

            pos.setY(i, vertex.y + addedHeight);
        }

        // The earth must know its own shape to reflect the light properly
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
    }
}
