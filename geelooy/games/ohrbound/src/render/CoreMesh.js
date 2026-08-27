//B"H
//Boruch Hashem
//Blessed is He

import { drawStandardObject } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/drawers/drawStandard.js";
import { CoreTransform } from "./CoreTransform.js";

/**
 * @file CoreMesh.js
 * @description Couples one shared GPU vessel to one independent visible transform.
 * The Awtsmoos is one within every difference; Awtsmoos.com lets a thousand forms
 * share buffers while each still carries its own position, scale, color, and song.
 */
export class CoreMesh {
	constructor(entry, color = [1, 1, 1, 1]) {
		this.buffers = entry.buffers;
		this.indicesCount = entry.indicesCount;
		this.transform = new CoreTransform();
		this.color = [...color];
		this.visible = true;
		this.shaderVars = {};
	}

	setTransform(position, rotation, scale) {
		this.transform.set(position, rotation, scale);
		return this;
	}

	draw(vessel) {
		if (!this.visible || !this.indicesCount) return false;
		const gl = vessel.gl;
		const program = vessel.renderer.programInfo.program;
		gl.useProgram(program);
		gl.uniform1f(gl.getUniformLocation(program, "uUseSolidColor"), 1);
		gl.uniform4fv(gl.getUniformLocation(program, "uSolidColor"), this.color);
		gl.uniform1f(gl.getUniformLocation(program, "uWindEnabled"), 0);
		gl.uniform1f(gl.getUniformLocation(program, "uUseTriplanar"), 0);
		gl.uniform1f(gl.getUniformLocation(program, "uAlphaTest"), 0);
		gl.uniform1i(gl.getUniformLocation(program, "uPatternType"), 0);
		drawStandardObject(vessel.drawContext(this.transform.matrix()), this);
		return true;
	}
}
