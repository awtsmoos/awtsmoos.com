
/**
 * @module SafeMaterialApplier
 * @description
 * B"H
 * 🛠️ CHAPTER 19.5: THE HARDENING OF MATERIALS 🛠️
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class SafeMaterialApplier {
    static apply(materialName, options = {}) {
        try {
            const slots =['map', 'normalMap', 'emissiveMap', 'lightMap'];
            slots.forEach(s => {
                if (options[s] && typeof options[s] === 'object' && !options[s].isTexture) {
                    options[s] = null;
                }
            });

            // B"H: ENSURE VISIBILITY
            options.visible = true;
            options.opacity = options.opacity !== undefined ? options.opacity : 1.0;

            let material;
            if (THREE[materialName]) {
                material = new THREE[materialName](options);
            } else {
                console.warn(`B"H - ⚠️ Material ${materialName} not in THREE. Using Lambert.`);
                material = new THREE.MeshLambertMaterial(options);
            }

            return this._strengthen(material);
        } catch (e) {
            console.error(`B"H - 🆘 [SafeMaterial]: Failed. Returning blinding void proxy.`);
            return new THREE.MeshBasicMaterial({ color: 0x00FFED, wireframe: true, visible: true });
        }
    }

    static _strengthen(mat) {
        if (!mat) return mat;

        const maps = ['map', 'normalMap', 'lightMap', 'emissiveMap'];
        maps.forEach(m => {
            if (mat[m]) {
                if (!mat[m].matrix) mat[m].matrix = new THREE.Matrix3();
                if (mat[m].channel === undefined) mat[m].channel = 0;
            }
        });

        const originalOnBefore = mat.onBeforeCompile;
        mat.onBeforeCompile = (shader) => {
            // B"H: UV PROTECTION
            // Ensure any reference to 'uv' in the shader is valid.
            shader.vertexShader = shader.vertexShader.replace(/uvundefined/g, "uv");
            shader.fragmentShader = shader.fragmentShader.replace(/uvundefined/g, "vUv");
            
            if (originalOnBefore) originalOnBefore(shader);
        };

        return mat;
    }
}
