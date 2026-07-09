
// B"H
/**
 * @module EmeraldShaderEntry
 */
import ShaderInjector from "./ShaderInjector.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

export default class EmeraldShader {
    static apply(material) {
        if (!material) return;
        material.onBeforeCompile = (shader) => {
            ShaderInjector.inject(shader);
        };
    }
}
