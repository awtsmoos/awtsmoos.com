
// B"H
/**
 * @module BrickShaderEntry
 */
import ShaderInjector from "./ShaderInjector.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class BrickShader {
    static apply(material) {
        if (!material) return;
        material.onBeforeCompile = (shader) => {
            ShaderInjector.inject(shader);
        };
    }
}
