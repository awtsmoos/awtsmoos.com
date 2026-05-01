
// B"H
/**
 * @module BrickShaderEntry
 */
import ShaderInjector from "./ShaderInjector.js";

export default class BrickShader {
    static apply(material) {
        if (!material) return;
        material.onBeforeCompile = (shader) => {
            ShaderInjector.inject(shader);
        };
    }
}
