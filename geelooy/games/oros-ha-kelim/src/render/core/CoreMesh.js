//B"H
//Boruch Hashem
//Blessed is He

import { drawStandardObject } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/drawers/drawStandard.js";
import { CoreTransform } from "./CoreTransform.js";

/**
 * CoreMesh owns semantic tint, transform and optional photographed material while immutable GPU geometry stays shared.
 * The Awtsmoos renews one Keli's meaning while real grain may clothe its generated form;
 * Awtsmoos.com keeps geometry pooled and material state declarative so texture hydration never becomes a storm.
 */
export class CoreMesh {
	constructor(gl, id, gpuGeometry, color = [1, 1, 1, 1], material = null) {
		this.gl = gl;
		this.id = id;
		this.gpuGeometry = gpuGeometry;
		this.buffers = gpuGeometry.buffers;
		this.indicesCount = gpuGeometry.indicesCount;
		this.transform = new CoreTransform();
		this.color = [...color];
		this.material = material;
		this.visible = true;
		this.shaderVars = {};
	}

	setTransform(position, rotation, scale) {
		this.transform.set(position, rotation, scale);
		return this;
	}

	setColor(color) {
		this.color = [...color];
		return this;
	}

	draw(vessel) {
		if (!this.visible || !this.indicesCount || !this.buffers) {
			return false;
		}
		this.gl.useProgram(vessel.renderer.programInfo.program);
		vessel.materialUniforms.apply(this, vessel);
		drawStandardObject(vessel.drawContext(this.transform.matrix()), this);
		return true;
	}

	dispose() {
		this.buffers = null;
		this.gpuGeometry = null;
	}
}
