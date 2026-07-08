
/**
 * B"H
 * @module ShaderApplier
 * @description
 * The divine surgeon. Injects the modular shader snippets into the Three.js material 
 * compilation pipeline. Every replacement is wrapped in its own try-catch vessel.
 */
import VertexLogic from "./VertexLogic.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import FragmentHeader from "./FragmentHeader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import FragmentBody from "./FragmentBody.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ShaderApplier {
    static run(shader) {
        // B"H: The Great Protector. 
        // We only modify materials that contain the standard color properties.
        if (!shader || !shader.uniforms || shader.uniforms.diffuse === undefined) return;

        try {
            // 1. Vertex Transformation
            shader.vertexShader = VertexLogic.getVertexShaderHeader() + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                VertexLogic.getVertexShaderBody()
            );
        } catch (e) {
            console.error("B\"H - ⚡ Vertex Injection Shattered.", e);
        }

        try {
            // 2. Fragment Manifestation
            shader.fragmentShader = FragmentHeader.get() + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                '#include <color_fragment>\n' + FragmentBody.get()
            );
        } catch (e) {
            console.error("B\"H - ⚡ Fragment Injection Shattered.", e);
        }
    }
}
