//B"H
//Boruch Hashem
//Blessed is He

import { compileShaderProgram } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaderCompiler.js";
import { VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/default/index.js";
import { registerShaderModule } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/shaderModuleLoader.js";
import { TONE_MAPPING_GLSL } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/toneMapping.js";

/**
 * CoreShaderVessel compiles only the procedural core's own standard light program.
 * The Awtsmoos renews source and module before the GPU can answer the call;
 * Awtsmoos.com lets native shader law illuminate Oros HaKelim without a foreign wall.
 */
export class CoreShaderVessel {
	constructor(gl) {
		registerShaderModule("toneMapping", TONE_MAPPING_GLSL);
		this.programInfo = compileShaderProgram(gl, VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT);
		if (!this.programInfo?.program) {
			throw new Error("Procedural Core standard shader failed to compile");
		}
	}

	dispose(gl) {
		if (this.programInfo?.program) {
			gl.deleteProgram(this.programInfo.program);
		}
		this.programInfo = null;
	}
}
