
/**
 * @module SafeMaterialApplier
 * @description
 * B"H
 * 🛠️ CHAPTER 19.5: THE HARDENING OF MATERIALS 🛠️
 */
import * as THREE from '/games/scripts/build/three.module.js';

import { ARCHITECTURAL_SHADERS } from '../../../utils/3d/procedural/Shaders/SederHishtalshelusShaders.js';

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
            const shaderData = ARCHITECTURAL_SHADERS[materialName];
            
            if (shaderData) {
                material = new THREE.MeshStandardMaterial({
                    color: options.color || (materialName === "AwtsmoosFloorMaterial" ? 0xdddddd : 0x8b4513),
                    roughness: 0.7,
                    metalness: 0.1,
                });
                material.userData.awtsmoosType = materialName;
            } else if (THREE[materialName]) {
                material = new THREE[materialName](options);
            } else {
                console.warn(`B"H - ⚠️ Material ${materialName} not in THREE. Using Standard.`);
                material = new THREE.MeshStandardMaterial(options);
            }

            return this._strengthen(material);
        } catch (e) {
            console.error(`B"H - 🆘 [SafeMaterial]: Failed. Returning blinding void proxy.`);
            return new THREE.MeshBasicMaterial({ color: 0x00FFED, wireframe: true, visible: true });
        }
    }

    static _strengthen(mat) {
        if (!mat) return mat;

        mat.customProgramCacheKey = () => {
            return mat.userData.awtsmoosType || 'standard';
        };

        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uHighlight = { value: 0.0 };
            mat.userData.shader = shader; 

            shader.vertexShader = `
                varying vec3 vWorldPosition;
                varying vec3 vNormalVec;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                vNormalVec = normalize(normalMatrix * normal);
                `
            );

            const type = mat.userData.awtsmoosType;
            const shaderData = ARCHITECTURAL_SHADERS[type];
            const patternLogic = shaderData ? (shaderData.fragment || '') : '';
            const patternHeader = shaderData ? (shaderData.header || '') : '';

            shader.fragmentShader = `
                uniform float uHighlight;
                varying vec3 vWorldPosition;
                varying vec3 vNormalVec;
                ${patternHeader}
            ` + shader.fragmentShader;

            if (patternLogic) {
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <color_fragment>',
                    `
                    #include <color_fragment>
                    ${patternLogic}
                    `
                );
            }

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
                gl_FragColor.rgb *= (1.0 + uHighlight * 0.4); 
                gl_FragColor.rgb += vec3(0.1, 0.08, 0.05) * uHighlight;
                `
            );

            shader.vertexShader = shader.vertexShader.replace(/uvundefined/g, "uv");
            shader.fragmentShader = shader.fragmentShader.replace(/uvundefined/g, "vUv");
        };

        return mat;
    }
}
