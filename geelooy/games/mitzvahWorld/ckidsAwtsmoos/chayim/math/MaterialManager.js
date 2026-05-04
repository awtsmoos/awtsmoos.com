/**
 * B"H
 * @file MaterialManager.js
 * @description
 * THE ALCHEMY OF TOYR — Material Refinement System
 * 
 * Chapter 32: The Integration of Nitzotzos (Sparks).
 * 
 * This system allows the manifestation of complex, shader-driven materials 
 * without the direct use of THREE in the higher-level logic. 
 * It manages the Tzimtzum (contraction) of shader snippets into the 
 * final vessel of the MeshLambertMaterial or MeshStandardMaterial.
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class MaterialManager {
    /**
     * @method create
     * @description Creates a material based on a type and refinements.
     * @param {string} baseType - 'Lambert', 'Standard', 'Basic', etc.
     * @param {Object} options - Standard THREE material options.
     * @param {Object} snippets - Shader snippets for onBeforeCompile.
     * @returns {THREE.Material}
     */
    static create(baseType = 'Lambert', options = {}, snippets = null) {
        const typeName = `Mesh${baseType}Material`;
        const MaterialClass = THREE[typeName] || THREE.MeshLambertMaterial;
        
        const mat = new MaterialClass(options);

        if (snippets) {
            this.refine(mat, snippets);
        }

        return mat;
    }

    /**
     * @method createRawShader
     * @description Creates a THREE.ShaderMaterial from vertex and fragment strings.
     */
    static createRawShader(options = {}) {
        return new THREE.ShaderMaterial(options);
    }

    /**
     * @method refine
     * @description Applies shader snippets to an existing material.
     * @param {THREE.Material} mat 
     * @param {Object} snippets 
     */
    static refine(mat, snippets) {
        mat.onBeforeCompile = (shader) => {
            // 1. Inject Uniforms
            if (snippets.uniforms) {
                Object.assign(shader.uniforms, snippets.uniforms);
            }

            // 2. Vertex Shader Tikkun
            if (snippets.vertex) {
                if (snippets.vertex.head) {
                    shader.vertexShader = shader.vertexShader.replace('#include <common>', `
                        #include <common>
                        ${snippets.vertex.head}
                    `);
                }
                if (snippets.vertex.main) {
                    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                        #include <begin_vertex>
                        ${snippets.vertex.main}
                    `);
                }
            }

            // 3. Fragment Shader Tikkun
            if (snippets.fragment) {
                if (snippets.fragment.head) {
                    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
                        #include <common>
                        ${snippets.fragment.head}
                    `);
                }
                if (snippets.fragment.color) {
                    // B"H: THE DIVINE INTERCEPTION
                    // We seek the point where the base color and textures are unified.
                    // 1. Try to find the map fragment - this ensures textures are loaded!
                    // 2. Fall back to color fragment (vertex colors)
                    // 3. Fall back to raw diffuseColor initialization
                    
                    let target = null;
                    if (shader.fragmentShader.includes('#include <map_fragment>')) {
                        target = '#include <map_fragment>';
                    } else if (shader.fragmentShader.includes('#include <color_fragment>')) {
                        target = '#include <color_fragment>';
                    } else if (shader.fragmentShader.includes('vec4 diffuseColor = vec4( diffuse, opacity );')) {
                        target = 'vec4 diffuseColor = vec4( diffuse, opacity );';
                    }

                    if (target) {
                        shader.fragmentShader = shader.fragmentShader.replace(target, `
                            ${target}
                            ${snippets.fragment.color}
                        `);
                    } else {
                        // B"H: If no target found, prepend to main to be safe, but this is rare in Lambert/Standard
                        shader.fragmentShader = shader.fragmentShader.replace('void main() {', `void main() {\n${snippets.fragment.color}`);
                    }
                }
            }

            mat.userData.shader = shader; // B"H: Keep for reference
        };
        mat.needsUpdate = true;
    }
}
