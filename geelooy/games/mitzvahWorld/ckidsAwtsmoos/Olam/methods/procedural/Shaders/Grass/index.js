
/**
 * B"H
 * @module GrassShaderEntry
 * @description
 * The Gateway to the Emerald Void's textures. 
 * Re-established at the path where the universe looks for it.
 * This file uses purely modular imports to ensure correct MIME types and stability.
 */
import ShaderInjector from "./ShaderInjector.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class GrassShader {
    /**
     * @function apply
     * @description Applies the intense procedural grass effect to a material.
     * @param {THREE.Material} material 
     */
    static apply(material) {
        if (!material) return;
        try {
            material.onBeforeCompile = (shader) => {
                ShaderInjector.inject(shader);
            };
        } catch (e) {
            console.error("B\"H - ⚡ Failed to enliven material with grass.", e);
        }
    }
}
