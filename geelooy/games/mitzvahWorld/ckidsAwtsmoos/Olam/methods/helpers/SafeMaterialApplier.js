
// B"H
/**
 * @module SafeMaterialApplier
 * @description
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

            let material;
            if (THREE[materialName]) {
                material = new THREE[materialName](options);
            } else {
                material = new THREE.MeshLambertMaterial(options);
            }

            return this._strengthen(material);
        } catch (e) {
            console.error(`B"H - 🆘 FAILED MATERIAL: Returning blinding void proxy.`);
            return new THREE.MeshBasicMaterial({ color: 0x00FFED, wireframe: true });
        }
    }

    static _strengthen(mat) {
        if (!mat) return mat;

        ['map', 'normalMap', 'lightMap'].forEach(m => {
            if (mat[m]) {
                if (!mat[m].matrix) mat[m].matrix = new THREE.Matrix3();
                if (mat[m].channel === undefined) mat[m].channel = 0;
            }
        });

        const originalOnBefore = mat.onBeforeCompile;
        mat.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(/uvundefined/g, "uv");
            shader.fragmentShader = shader.fragmentShader.replace(/uvundefined/g, "vUv");
            if (originalOnBefore) originalOnBefore(shader);
        };

        return mat;
    }
}
