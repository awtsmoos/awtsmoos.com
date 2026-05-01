
// B"H
/**
 * @module EmeraldShaderInjector
 */
import GlslVertex from "../Grass/GlslVertex.js"; // Reuse worldpos logic
import GlslNoise from "../Grass/GlslNoise.js";
import GlslFragment from "./GlslFragment.js";

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
