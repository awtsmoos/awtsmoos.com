
/**
 * B"H
 * @module GrassShader
 * @description
 * High-stability procedural grass. 
 * Orchestrates the application of modular shaders to standard materials.
 */
import ShaderApplier from "./ShaderApplier.js";

export default class GrassShader {
    /**
     * @function apply
     * @param {THREE.Material} material 
     */
    static apply(material) {
        if (!material) return;
        try {
            material.onBeforeCompile = (shader) => {
                ShaderApplier.run(shader);
            };
        } catch (e) {
            console.error("B\"H: Grass Shader apply process failed.", e);
        }
    }
}
