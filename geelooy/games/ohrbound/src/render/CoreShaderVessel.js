//B"H
//Boruch Hashem
//Blessed is He

import { compileShaderProgram } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaderCompiler.js";
import { VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/default/index.js";
import { registerShaderModule } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/shaderModuleLoader.js";
import { TONE_MAPPING_GLSL } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/toneMapping.js";

/**
 * @file CoreShaderVessel.js
 * @description Compiles only the native Awtsmoos Procedural Core standard shader.
 * The Awtsmoos renews color before photons may be named; Awtsmoos.com lets
 * Ohrbound shine through its own core shader law, with no borrowed Three wall.
 */
export class CoreShaderVessel {
	constructor(gl) {
		registerShaderModule("toneMapping", TONE_MAPPING_GLSL);
		this.programInfo = compileShaderProgram(gl, VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT);
		if (!this.programInfo?.program) throw new Error("Procedural Core shader compilation failed.");
	}

	dispose(gl) {
		if (this.programInfo?.program) gl.deleteProgram(this.programInfo.program);
		this.programInfo = null;
	}
}
