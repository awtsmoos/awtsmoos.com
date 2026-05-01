
// B"H
/**
 * @module EmeraldShaderEntry
 */
import ShaderInjector from "./ShaderInjector.js";

export default class EmeraldShader {
    static apply(material) {
        if (!material) return;
        material.onBeforeCompile = (shader) => {
            ShaderInjector.inject(shader);
        };
    }
}
