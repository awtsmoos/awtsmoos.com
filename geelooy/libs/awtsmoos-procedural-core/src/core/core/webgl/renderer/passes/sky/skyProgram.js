
// B"H
/**
 * @file skyProgram.js
 * @brief Manifests the shader program for the heavens.
 * 
 * THE HYMN OF THE COMPILED FIRMAMENT:
 * We reach three levels up to the Compiler of Truth,
 * Rekindling the vision of the firmament's youth.
 * From the passes to the renderer, to the webgl heights,
 * We fetch the sacred tools to ignite the sky's lights.
 */
import { compileShaderProgram } from '../../../shaderCompiler.js';
import { VS_SKY, FS_SKY } from './skyShaders.js';

export class SkyProgram {
    static init(gl) {
        console.log("B\"H - SkyProgram: Compiling the Blueprint of the Heavens.");
        const progInfo = compileShaderProgram(gl, VS_SKY, FS_SKY);
        return progInfo ? progInfo.program : null;
    }
}
