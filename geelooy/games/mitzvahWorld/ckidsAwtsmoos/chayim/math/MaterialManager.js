
/**
 * @file MaterialManager.js
 * @description
 * 🏰 CHAPTER 0: THE ARCHITECTURE OF TOYR 🏰
 * 
 * The central station for all material manifestation.
 * It manages the creation and refinement of materials via 
 * its modular sub-faculties.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import UniformScribe from './MaterialManager/UniformScribe.js';
import ShaderInscriber from './MaterialManager/ShaderInscriber.js';

export default class MaterialManager {
    static create(baseType = 'Standard', options = {}, snippets = null) {
        const typeName = `Mesh${baseType}Material`;
        const MaterialClass = THREE[typeName] || THREE.MeshStandardMaterial;
        
        // Ensure transparency if discard logic is detected
        if (snippets?.fragment?.color?.includes('discard')) {
            options.transparent = true;
            options.alphaTest = 0.2;
        }

        const mat = new MaterialClass(options);
        if (snippets) this.refine(mat, snippets);
        return mat;
    }

    static createRawShader(options = {}) {
        console.log("B\"H - 🧪 [MaterialManager] Creating Raw Shader Material...");
        return new THREE.ShaderMaterial(options);
    }

    static refine(mat, snippets) {
        const hash = 'awts_' + (snippets.vertex?.head?.length || 0) + '_' + (snippets.fragment?.color?.length || 0);
        mat.customProgramCacheKey = () => hash;

        mat.onBeforeCompile = (shader) => {
            console.log(`B"H - 🛠️ [MaterialManager] Refining [${mat.type}]. Hash: ${hash}`);
            
            const safeUniforms = UniformScribe.sanctify(snippets.uniforms);
            Object.assign(shader.uniforms, safeUniforms);
            mat.userData.shaderUniforms = shader.uniforms;

            ShaderInscriber.engrave(shader, snippets);
            mat.userData.shader = shader;
        };
        mat.needsUpdate = true;
    }
}
