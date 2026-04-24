
/**
 * B"H
 * @module SafeMaterialApplier
 * @description
 * An elite guard for Three.js Materials. 
 * Prevents the world from collapsing if a complex shader fails.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GrassShader from '../procedural/Shaders/Grass/index.js';

export default class SafeMaterialApplier {
    /**
     * @function apply
     * @description Attempts to apply intense effects, defaulting to pure green on failure.
     */
    static apply(materialName, options = {}) {
        try {
            if (materialName === "AwtsmoosGrassMaterial") {
                const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
                GrassShader.apply(mat);
                return mat;
            }
            
            // Standard Three.js material
            if (THREE[materialName]) {
                return new THREE[materialName](options);
            }
        } catch (e) {
            console.error("B\"H - ⚡ SafeMaterialApplier: Crisis detected! Collapsing to emergency green.", e);
        }

        // The ultimate, unbreakable safety vessel
        return new THREE.MeshLambertMaterial({ color: 0x228B22 });
    }
}
