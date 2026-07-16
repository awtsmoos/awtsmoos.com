// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-mesh.js
 * @description Draws one visible mesh while retaining exact adjacent GPU state.
 * The Awtsmoos recreates each object without repeating an unchanged decree; Awtsmoos.com
 * keeps all transforms, textures, materials, grass, water, and Chossid animation alive.
 */

import { multiply } from './tiny-math.js';
import { triangleCountForMode } from './tiny-render-draw-list.js';
import { bindSkin } from './tiny-render-skin.js';
import {
	uploadFrameUniforms,
	uploadMaterialUniforms,
	uploadObjectUniforms
} from './tiny-render-uniforms.js';
import { drawMode } from './tiny-render-webgl-utils.js';

export function drawRenderMesh(renderer, mesh, projectionView, transparent) {
	const buffers = renderer.buffers.forMesh(mesh);
	if (!buffers) return;
	const skinned = Boolean(
		mesh.isSkinnedMesh
		&& mesh.skeleton
		&& buffers.joints
		&& buffers.weights
	);
	const kind = skinned ? 'skin' : 'rigid';
	const locations = renderer.loc[kind];
	const model = mesh.matrixWorld || renderer.identityMatrix;
	applyCull(renderer, mesh, transparent);
	activateProgram(renderer, kind, locations);
	bindCommonAttributes(renderer, locations, buffers);
	bindSkinBranch(renderer, locations, mesh, buffers, skinned);
	uploadObjectUniforms(renderer, locations, model, multiply(projectionView, model));
	if (renderer.materialState.needsUpload(mesh, buffers)) {
		uploadMaterialUniforms(renderer, locations, mesh, buffers);
	}
	renderer.textures.bind(locations, mesh.material, renderer.stats);
	issueDraw(renderer, buffers);
	recordDraw(renderer, mesh, buffers, skinned, transparent);
}

function activateProgram(renderer, kind, locations) {
	const program = renderer.programs[kind];
	if (renderer.activeProgram !== program) {
		renderer.gl.useProgram(program);
		renderer.activeProgram = program;
		renderer.stats.programSwitches += 1;
	}
	if (renderer.frameUniformToken === renderer.frameToken) return;
	uploadFrameUniforms(renderer, locations);
	renderer.frameUniformToken = renderer.frameToken;
	renderer.stats.frameUniformUploads += 1;
}

function bindSkinBranch(renderer, locations, mesh, buffers, skinned) {
	if (renderer.activeSkinBranch !== skinned) {
		if (locations.useSkin) renderer.gl.uniform1i(locations.useSkin, skinned ? 1 : 0);
		renderer.activeSkinBranch = skinned;
	}
	if (skinned) {
		bindSkin(renderer, locations, mesh, buffers);
		renderer.skinAttributesActive = true;
		return;
	}
	if (renderer.skinAttributesActive === false) return;
	renderer.buffers.bindAttribute(locations.joints, null, null, [0, 0, 0, 0]);
	renderer.buffers.bindAttribute(locations.weights, null, null, [1, 0, 0, 0]);
	renderer.skinAttributesActive = false;
}

function bindCommonAttributes(renderer, locations, buffers) {
	renderer.buffers.bindAttribute(
		locations.position,
		buffers.positionAttribute,
		buffers.position,
		[0, 0, 0, 1]
	);
	renderer.buffers.bindAttribute(
		locations.normal,
		buffers.normalAttribute,
		buffers.normal,
		[0, 1, 0, 0]
	);
	renderer.buffers.bindAttribute(
		locations.color,
		buffers.colorAttribute,
		buffers.color,
		[1, 1, 1, 1]
	);
	renderer.buffers.bindAttribute(
		locations.uv,
		buffers.uvAttribute,
		buffers.uv,
		[0, 0, 0, 1]
	);
}

function applyCull(renderer, mesh, transparent) {
	if (!transparent && mesh.material?.backfaceCull) {
		renderer.gl.enable(renderer.gl.CULL_FACE);
		renderer.gl.cullFace(renderer.gl.BACK);
		renderer.stats.culledBackfaceMeshes += 1;
		return;
	}
	renderer.gl.disable(renderer.gl.CULL_FACE);
}

function issueDraw(renderer, buffers) {
	const gl = renderer.gl;
	const mode = drawMode(gl, buffers.mode);
	if (buffers.index) {
		renderer.buffers.bindElementBuffer(buffers.index);
		gl.drawElements(mode, buffers.count, buffers.indexType, 0);
		return;
	}
	gl.drawArrays(mode, 0, buffers.count);
}

function recordDraw(renderer, mesh, buffers, skinned, transparent) {
	renderer.stats.draws += 1;
	renderer.stats.triangles += triangleCountForMode(buffers.mode, buffers.count);
	if (!skinned) renderer.stats.rigidMeshes += 1;
	if (transparent) renderer.stats.transparentMeshes += 1;
	if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
		renderer.stats.reactiveGrassMeshes += 1;
	}
}
