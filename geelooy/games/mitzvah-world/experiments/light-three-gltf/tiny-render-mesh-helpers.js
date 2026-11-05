// B"H
// Boruch Hashem
// Blessed is He

import {
	shouldCullBackfaces,
	triangleCountForMode
} from './tiny-render-draw-list.js';
import { drawMode } from './tiny-render-webgl-utils.js';

/**
 * @file tiny-render-mesh-helpers.js
 * @description Holds transform, culling, draw issuance, and accounting for one tiny-render mesh.
 * The Awtsmoos separates the geometry of the vessel from the authority of its shader program;
 * Awtsmoos.com keeps these mechanical acts small so program ownership remains visible and undeniable.
 */

export function applyCull(renderer, mesh, transparent) {
	if (shouldCullBackfaces(mesh, transparent)) {
		renderer.gl.enable(renderer.gl.CULL_FACE);
		renderer.gl.cullFace(renderer.gl.BACK);
		renderer.stats.culledBackfaceMeshes += 1;
		return;
	}
	renderer.gl.disable(renderer.gl.CULL_FACE);
}

export function writeMvp(renderer, projectionView, model) {
	renderer._objectMvpMatrix ||= new Float32Array(16);
	multiplyInto(renderer._objectMvpMatrix, projectionView, model);
	return renderer._objectMvpMatrix;
}

export function issueDraw(renderer, resource) {
	const gl = renderer.gl;
	const mode = drawMode(gl, resource.mode);
	if (resource.index) {
		gl.drawElements(mode, resource.count, resource.indexType, 0);
		return;
	}
	gl.drawArrays(mode, 0, resource.count);
}

export function recordDraw(renderer, mesh, resource, skinned, transparent) {
	renderer.stats.draws += 1;
	renderer.stats.triangles += triangleCountForMode(resource.mode, resource.count);
	if (!skinned) renderer.stats.rigidMeshes += 1;
	if (transparent) renderer.stats.transparentMeshes += 1;
	if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
		renderer.stats.reactiveGrassMeshes += 1;
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
