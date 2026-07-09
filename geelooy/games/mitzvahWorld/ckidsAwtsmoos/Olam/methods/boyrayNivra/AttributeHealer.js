
/**
 * @file AttributeHealer.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 18: THE HEALER OF BROKEN ATTRIBUTES                            ║
 * ║                                                                          ║
 * ║  "I am the Lord your healer." (Shemot 15:26)                             ║
 * ║                                                                          ║
 * ║  Many 3D vessels arrive from external realms (Blender, API) missing      ║
 * ║  the 'uv' attribute. When our intense shaders attempt to texture them,   ║
 * ║  the GPU encounters a void where it expected coordinates, causing a      ║
 * ║  fatal crash (uvundefined).                                             ║
 * ║                                                                          ║
 * ║  This module inspects and heals every node, filling missing attributes   ║
 * ║  with a seed of zeroed-out data, satisfying the strict judgment of       ║
 * ║  the GPU compiler while allowing the soul to be seen.                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default class AttributeHealer {

    /**
     * @static
     * @function heal
     * @description Inspects a single node and repairs its geometry.
     */
    static heal(node) {
        if (!node || !node.isMesh || !node.geometry) return;

        const geometry = node.geometry;
        
        // 1. THE UV COVENANT
        // Ensure UVs exist so textures can be wrapped around the form.
        if (!geometry.attributes.uv) {
            const count = geometry.attributes.position ? geometry.attributes.position.count : 0;
            if (count > 0) {
                // B"H: silent

                const uvs = new Float32Array(count * 2); 
                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            }
        }

        // 2. THE NORMAL RECLAMATION
        // If lighting fails, we calculate the surface vectors.
        if (!geometry.attributes.normal) {
            geometry.computeVertexNormals();
        }
        
        // 3. THE TEXTURE MATRIX PROTECTION
        // Ensure any map applied to the material has an initialized matrix.
        if (node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(m => {
                const mapSlots = ['map', 'normalMap', 'specularMap', 'emissiveMap', 'lightMap'];
                mapSlots.forEach(slot => {
                    if (m[slot] && m[slot].isTexture && !m[slot].matrix) {
                        m[slot].matrix = new THREE.Matrix3();
                    }
                });
            });
        }
    }
}
