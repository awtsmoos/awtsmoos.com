// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * @module RawMeshFactory
 * @description
 * 💎 THE FOUNDATION OF FORM 💎
 * Allows building geometry from raw vertex and index data.
 */
export default class RawMeshFactory {
    static create(instruction) {
        if (instruction.type !== 'raw') return null;

        const vertices = instruction.vertices || [];
        const indices = instruction.indices || [];
        const uvs = instruction.uvs || [];

        const geometry = new THREE.BufferGeometry();
        
        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
        }
        
        if (indices.length > 0) {
            geometry.setIndex(indices);
        }

        if (uvs.length > 0) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs.flat(), 2));
        } else if (vertices.length > 0) {
            // Placeholder UVs
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(vertices.length * 2).fill(0), 2));
        }

        geometry.computeVertexNormals();
        return geometry;
    }
}
