
// B"H
/**
 * @module EmeraldShaderInjector
 */
import GlslVertex from "../Grass/GlslVertex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"; // Reuse worldpos logic
import GlslNoise from "../Grass/GlslNoise.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import GlslFragment from "./GlslFragment.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ShaderInjector {
    static inject(shader) {
        if (!shader || !shader.uniforms || shader.uniforms.diffuse === undefined) return;

        shader.vertexShader = GlslVertex.getHeader() + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            GlslVertex.getBody()
        );

        shader.fragmentShader = GlslFragment.getHeader() + 
                              GlslNoise.getHeader() + 
                              shader.fragmentShader;
        
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            GlslFragment.getBody()
        );
    }
}
