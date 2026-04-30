
// B"H
/**
 * @module SafeMaterialApplier
 * @description
 * * Chapter 19: The Perfection of the Vessel
 * Before a material can hold the Light, its properties must be standardized.
 * If a texture has no matrix, or if an unholy 'Object' attempts to pass as 
 * a Texture, the WebGL state machine will crumble!
 * * This module hardens every material, ensuring that 'uvundefined' is 
 * vanished from the shader strings and every map has a foundation.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class SafeMaterialApplier {
    /**
     * @function apply
     * @description Summons a material and wraps it in a shell of stability.
     */
    static apply(materialName, options = {}) {
        try {
            // 1. Sanitize Incoming Maps
            const mapTypes =['map', 'normalMap', 'specularMap', 'alphaMap', 'lightMap', 'envMap', 'emissiveMap'];
            mapTypes.forEach(m => {
                if (options[m] && typeof options[m] === 'object' && !options[m].isTexture) {
                    console.warn(`B"H - 🛡️ Destroyed unholy object posing as texture on '${m}'.`);
                    options[m] = null;
                }
            });

            // 2. Instantiate
            let material;
            if (THREE[materialName]) {
                material = new THREE[materialName](options);
            } else {
                material = new THREE.MeshLambertMaterial(options);
            }

            return this._harden(material);
        } catch (e) {
            console.error("B\"H - ⚡ Material Forge failure:", e);
            return new THREE.MeshBasicMaterial({ color: 0xFF00FF, wireframe: true });
        }
    }

    /**
     * @function _harden
     * @private
     * @description Forces internal properties to exist for shader compatibility.
     */
    static _harden(mat) {
        if (!mat) return mat;

        const maps =['map', 'normalMap', 'specularMap', 'alphaMap', 'lightMap', 'envMap'];
        maps.forEach(m => {
            if (mat[m]) {
                // THE FIX: Prevent 'cannot read property elements of undefined'
                if (!mat[m].matrix) mat[m].matrix = new THREE.Matrix3();
                if (mat[m].channel === undefined) mat[m].channel = 0;
                if (typeof mat[m].updateMatrix === 'function') mat[m].updateMatrix();
            }
        });

        // Guard against uvundefined errors in custom shaders
        const originalOnBefore = mat.onBeforeCompile;
        mat.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(/uvundefined/g, "uv");
            shader.fragmentShader = shader.fragmentShader.replace(/uvundefined/g, "vUv");
            
            if (originalOnBefore) originalOnBefore(shader);
        };

        return mat;
    }
}
