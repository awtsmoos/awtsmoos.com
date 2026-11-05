// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-instanced.js
 * @description Draws instanced casters into the sun depth map through the manual path.
 * The Awtsmoos multiplies one tuft into a field without confusion; Awtsmoos.com binds
 * each instanced vessel by hand so depth attribute layouts never leak into the main
 * pass's shared vertex arrays.
 */

import {
	INSTANCE_MATRIX_FLOATS,
	instanceCountFor
} from './tiny-instancing.js';
import { applyCull } from './tiny-render-mesh-helpers.js';
import { drawMode } from './tiny-render-webgl-utils.js';

/** Draws one instanced caster (or one variant) as depth; returns instances drawn. */
export function drawInstancedCasterDepth(renderer, geometryMesh, materialMesh, shadowMatrix) {
	const count = instanceCountFor(geometryMesh);
	if (count <= 0) return 0;
	const resource = renderer.buffers.forMesh(geometryMesh);
	if (!resource) return 0;
	const program = renderer.programs.depthInstanced;
	const locations = renderer.loc.depthInstanced;
	if (!program || !locations) return 0;
	renderer.gl.useProgram(program);
	renderer.activeProgram = program;
	applyCull(renderer, materialMesh, false);
	renderer.buffers.vertexArrays.releaseToDefault();
	renderer.buffers.manual.invalidate();
	renderer.buffers.manual.bind(resource, locations, false);
	const instanceBuffer = renderer.instanceBuffers.forMesh(geometryMesh);
	if (!instanceBuffer) return 0;
	bindDepthInstanceAttributes(renderer, locations, instanceBuffer);
	uploadDepthMvp(renderer, locations, shadowMatrix, materialMesh.matrixWorld);
	issueInstancedDepthDraw(renderer, resource, count);
	unbindDepthInstanceAttributes(renderer, locations);
	renderer.buffers.manual.invalidate();
	return count;
}

function uploadDepthMvp(renderer, locations, shadowMatrix, model) {
	renderer._depthMvp ||= new Float32Array(16);
	multiplyInto(renderer._depthMvp, shadowMatrix, model || renderer.identityMatrix);
	renderer.gl.uniformMatrix4fv(locations.depthMvp, false, renderer._depthMvp);
}

function issueInstancedDepthDraw(renderer, resource, count) {
	const gl = renderer.gl;
	const mode = drawMode(gl, resource.mode);
	if (resource.index) {
		renderer.instancing.drawElementsInstanced(mode, resource.count, resource.indexType, 0, count);
	} else {
		renderer.instancing.drawArraysInstanced(mode, 0, resource.count, count);
	}
}

function bindDepthInstanceAttributes(renderer, locations, buffer) {
	const gl = renderer.gl;
	const slots = locations.instanceMatrix || [];
	for (let column = 0; column < 4; column += 1) {
		const location = slots[column];
		if (!Number.isInteger(location) || location < 0) continue;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 4, gl.FLOAT, false, INSTANCE_MATRIX_FLOATS * 4, column * 16);
		renderer.instancing.vertexAttribDivisor(location, 1);
	}
}

function unbindDepthInstanceAttributes(renderer, locations) {
	const gl = renderer.gl;
	const slots = locations.instanceMatrix || [];
	for (let column = 0; column < 4; column += 1) {
		const location = slots[column];
		if (!Number.isInteger(location) || location < 0) continue;
		renderer.instancing.vertexAttribDivisor(location, 0);
		gl.disableVertexAttribArray(location);
	}
}

function multiplyInto(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
}
