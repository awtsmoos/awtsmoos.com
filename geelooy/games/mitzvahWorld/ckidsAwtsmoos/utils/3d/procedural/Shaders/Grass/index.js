
/**
 * B"H
 * @module GrassShader
 * @description
 * High-stability procedural grass. 
 * Detects if it's being compiled for a depth/shadow pass to avoid breaking the renderer.
 */
import NoiseFunctions from "./NoiseFunctions.js";
import ColorLogic from "./ColorLogic.js";

export default class GrassShader {
    static apply(material) {
        try {
            material.onBeforeCompile = (shader) => {
                // B"H: THE CRITICAL FIX.
                // Shadow maps use MeshDepthMaterial which often lacks 'vUv' or specialized attributes.
                // We check if 'diffuse' (standard in Lambert/Standard) exists before trying to modify color.
                // If it doesn't, we are likely in a depth pass; we exit to prevent 'uvundefined' crash.
                if (shader.uniforms.diffuse === undefined) return;

                try {
                    // 1. Setup World Position communication
                    shader.vertexShader = `varying vec3 vAwtsmoosWorldPos;\n` + shader.vertexShader;
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <worldpos_vertex>',
                        `#include <worldpos_vertex>\nvAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
                    );

                    // 2. Inject Noise into Fragment
                    shader.fragmentShader = `varying vec3 vAwtsmoosWorldPos;\n` + 
                                          NoiseFunctions.getFragmentHeader() + 
                                          shader.fragmentShader;

                    // 3. Apply Colors
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <color_fragment>',
                        `#include <color_fragment>\n` + ColorLogic.getFragmentLogic()
                    );
                    
                } catch (e) {
                    console.error("B\"H: Grass Shader compilation injection failed.", e);
                }
            };
        } catch (e) {
            console.error("B\"H: Grass Shader could not be applied.", e);
        }
    }
}
