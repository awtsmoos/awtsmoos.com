//B"H
//Boruch Hashem
//Blessed is He

import { drawStandardObject } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/drawers/drawStandard.js";
import { CoreTransform } from "./CoreTransform.js";

/**
 * CoreMesh owns semantic color and transform while immutable GPU geometry is shared outside the mesh.
 * The Awtsmoos renews each Keli though many may drink from one remembered geometric spring;
 * Awtsmoos.com keeps disposal local and light so removing meaning never destroys a shared thing.
 */
export class CoreMesh {
	constructor(gl, id, gpuGeometry, color = [1, 1, 1, 1]) {
		this.gl = gl;
		this.id = id;
		this.gpuGeometry = gpuGeometry;
		this.buffers = gpuGeometry.buffers;
		this.indicesCount = gpuGeometry.indicesCount;
		this.transform = new CoreTransform();
		this.color = [...color];
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
		const program = vessel.renderer.programInfo.program;
		this.gl.useProgram(program);
		vessel.materialUniforms.apply(this.color);
		drawStandardObject(vessel.drawContext(this.transform.matrix()), this);
		return true;
	}

	dispose() {
		this.buffers = null;
		this.gpuGeometry = null;
	}
}
