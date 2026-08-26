//B"H
//Boruch Hashem
//Blessed is He

import { drawStandardObject } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/drawers/drawStandard.js";
import { CoreTransform } from "./CoreTransform.js";

/**
 * @file CoreMesh.js
 * @description Lets one Procedural Core mesh reveal either fallback color or native triplanar albedo.
 * The Awtsmoos is one within every garment and form; Awtsmoos.com lets stone receive texture
 * only when its image is ready, while the same finite mesh remains visible through every storm.
 */
export class CoreMesh {
	constructor(entry, color = [1, 1, 1, 1], material = null) {
		this.buffers = entry.buffers;
		this.indicesCount = entry.indicesCount;
		this.transform = new CoreTransform();
		this.color = [...color];
		this.material = material;
		this.visible = true;
		this.shaderVars = {};
	}

	/** Replaces only the visual surface descriptor without recreating shared geometry. */
	setMaterial(material) {
		this.material = material;
		return this;
	}

	/** Updates one mesh transform while retaining its shared GPU buffers and material. */
	setTransform(position, rotation, scale) {
		this.transform.set(position, rotation, scale);
		return this;
	}

	/** Draws fallback color immediately and switches to native texture when available. */
	draw(vessel) {
		if (!this.visible || !this.indicesCount) {
			return false;
		}
		const gl = vessel.gl;
		const program = vessel.renderer.programInfo.program;
		const textureName = this.material?.texture;
		const textured = Boolean(
			textureName && vessel.renderer.textures[textureName]
		);
		this.shaderVars = textured
			? {
				uTexture: textureName,
				uTextureScale: this.material?.scale || 1
			}
			: {};
		gl.useProgram(program);
		gl.uniform1f(
			gl.getUniformLocation(program, "uUseSolidColor"),
			textured ? 0 : 1
		);
		gl.uniform4fv(
			gl.getUniformLocation(program, "uSolidColor"),
			this.color
		);
		gl.uniform1f(gl.getUniformLocation(program, "uWindEnabled"), 0);
		gl.uniform1f(
			gl.getUniformLocation(program, "uUseTriplanar"),
			textured && this.material?.triplanar !== false ? 1 : 0
		);
		gl.uniform1f(gl.getUniformLocation(program, "uAlphaTest"), 0);
		gl.uniform1i(gl.getUniformLocation(program, "uPatternType"), 0);
		drawStandardObject(
			vessel.drawContext(this.transform.matrix()),
			this
		);
		return true;
	}
}
