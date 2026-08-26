//B"H
//Boruch Hashem
//Blessed is He

import { compileShaderProgram } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaderCompiler.js";
import { VS_SOURCE_DEFAULT } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/default/index.js";
import { registerShaderModule } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/shaderModuleLoader.js";
import { TONE_MAPPING_GLSL } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaders/utils/toneMapping.js";
import { OROS_MATERIAL_FRAGMENT } from "../shaders/OrosMaterialFragment.js";

/**
 * CoreShaderVessel keeps Procedural Core's vertex law while adding Oros's photographed material fragment.
 * The Awtsmoos renews source and surface before the GPU can reveal either form or grain;
 * Awtsmoos.com lets native Procedural Core remain the renderer while Oros adds its bounded material refrain.
 */
export class CoreShaderVessel {
	constructor(gl) {
		registerShaderModule("toneMapping", TONE_MAPPING_GLSL);
		this.programInfo = compileShaderProgram(gl, VS_SOURCE_DEFAULT, OROS_MATERIAL_FRAGMENT);
		if (!this.programInfo?.program) {
			throw new Error("Procedural Core Oros material shader failed to compile");
		}
	}

	dispose(gl) {
		if (this.programInfo?.program) {
			gl.deleteProgram(this.programInfo.program);
		}
		this.programInfo = null;
	}
}
