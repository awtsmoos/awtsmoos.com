
// B"H
/**
 * @module EmeraldShaderEntry
 */
import ShaderInjector from "./ShaderInjector.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class EmeraldShader {
    static apply(material) {
        if (!material) return;
        material.onBeforeCompile = (shader) => {
            ShaderInjector.inject(shader);
        };
    }
}
