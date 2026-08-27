// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-mesh.js
 * @description Draws one mesh with reusable MVP storage and exact per-program state.
 * The Awtsmoos recreates each object without repeating an unchanged decree; Awtsmoos.com
 * keeps every transform, texture, cutout, water ripple, and Chossid alive without draw garbage.
 */

import {
	shouldCullBackfaces,
	triangleCountForMode
} from './tiny-render-draw-list.js';
import { bindSkin } from './tiny-render-skin.js';
import {
	uploadFrameUniforms,
	uploadMaterialUniforms,
	uploadObjectUniforms
} from './tiny-render-uniforms.js';
import { drawMode } from './tiny-render-webgl-utils.js';

export function drawRenderMesh(renderer, mesh, projectionView, transparent) {
	const resource = renderer.buffers.forMesh(mesh);
	if (!resource) return;
	const skinned = Boolean(
		mesh.isSkinnedMesh
		&& mesh.skeleton
		&& resource.attributes.joints
		&& resource.attributes.weights
	);
	const kind = skinned ? 'skin' : 'rigid';
	const locations = renderer.loc[kind];
	const model = mesh.matrixWorld || renderer.identityMatrix;
	applyCull(renderer, mesh, transparent);
	activateProgram(renderer, kind, locations);
	renderer.buffers.bindMesh(resource, locations, skinned);
	bindSkinBranch(renderer, locations, mesh, skinned);
	renderer._objectMvpMatrix ||= new Float32Array(16);
	multiplyInto(renderer._objectMvpMatrix, projectionView, model);
	uploadObjectUniforms(
		renderer,
		locations,
		model,
		renderer._objectMvpMatrix
	);
	if (renderer.materialState.needsUpload(mesh, resource)) {
		uploadMaterialUniforms(renderer, locations, mesh, resource);
	}
	renderer.textures.bind(locations, mesh.material, renderer.stats);
	issueDraw(renderer, resource);
	recordDraw(renderer, mesh, resource, skinned, transparent);
}

function activateProgram(renderer, kind, locations) {
	const program = renderer.programs[kind];
	if (renderer.activeProgram !== program) {
		renderer.gl.useProgram(program);
		renderer.activeProgram = program;
		renderer.materialState.previous = null;
		renderer.textures.invalidate();
		renderer.stats.programSwitches += 1;
	}
	renderer._frameUniformTokens ||= new Map();
	if (renderer._frameUniformTokens.get(program) === renderer.frameToken) return;
	uploadFrameUniforms(renderer, locations);
	renderer._frameUniformTokens.set(program, renderer.frameToken);
	renderer.frameUniformToken = renderer.frameToken;
	renderer.stats.frameUniformUploads += 1;
}

function bindSkinBranch(renderer, locations, mesh, skinned) {
	if (renderer.activeSkinBranch !== skinned) {
		if (locations.useSkin) {
			renderer.gl.uniform1i(locations.useSkin, skinned ? 1 : 0);
		}
		renderer.activeSkinBranch = skinned;
	}
	if (skinned) bindSkin(renderer, locations, mesh);
}

function applyCull(renderer, mesh, transparent) {
	if (shouldCullBackfaces(mesh, transparent)) {
		renderer.gl.enable(renderer.gl.CULL_FACE);
		renderer.gl.cullFace(renderer.gl.BACK);
		renderer.stats.culledBackfaceMeshes += 1;
		return;
	}
	renderer.gl.disable(renderer.gl.CULL_FACE);
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

function issueDraw(renderer, resource) {
	const gl = renderer.gl;
	const mode = drawMode(gl, resource.mode);
	if (resource.index) {
		gl.drawElements(mode, resource.count, resource.indexType, 0);
		return;
	}
	gl.drawArrays(mode, 0, resource.count);
}

function recordDraw(renderer, mesh, resource, skinned, transparent) {
	renderer.stats.draws += 1;
	renderer.stats.triangles += triangleCountForMode(
		resource.mode,
		resource.count
	);
	if (!skinned) renderer.stats.rigidMeshes += 1;
	if (transparent) renderer.stats.transparentMeshes += 1;
	if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
		renderer.stats.reactiveGrassMeshes += 1;
	}
}
