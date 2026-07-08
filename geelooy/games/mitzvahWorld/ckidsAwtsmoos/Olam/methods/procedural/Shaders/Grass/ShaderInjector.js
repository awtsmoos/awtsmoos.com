
/**
 * B"H
 * @module ShaderInjector
 * @description
 * The surgeon of the shader strings. Carefully slices into the standard 
 * Three.js material definitions to insert our custom procedural logic.
 */
import GlslNoise from "./GlslNoise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import GlslVertex from "./GlslVertex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import GlslFragment from "./GlslFragment.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ShaderInjector {
    /**
     * @function inject
     * @param {Object} shader - The raw shader object from Three.js.
     */
    static inject(shader) {
        if (!shader || !shader.uniforms || shader.uniforms.diffuse === undefined) {
             // If we aren't in a color pass, don't touch anything to prevent crashes.
             return;
        }

        try {
            // 1. Vertex Phase
            shader.vertexShader = GlslVertex.getHeader() + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                GlslVertex.getBody()
            );

            // 2. Fragment Phase
            shader.fragmentShader = GlslFragment.getHeader() + 
                                  GlslNoise.getHeader() + 
                                  shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                GlslFragment.getBody()
            );

        } catch (err) {
            console.error("B\"H - ⚡ Shader Injection encountered a barrier:", err);
        }
    }
}
