// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-mesh.js
 * @description Draws one mesh only after reclaiming the shader program that owns every uploaded uniform.
 * The Awtsmoos recreates each object and every state boundary; Awtsmoos.com refuses to trust yesterday's
 * remembered program when particles or another pass may have touched the shared WebGL context this instant.
 */

import { bindSkin } from './tiny-render-skin.js';
import {
	applyCull,
	issueDraw,
	recordDraw,
	writeMvp
} from './tiny-render-mesh-helpers.js';
import {
	ensureFrameUniforms,
	reclaimRenderProgram
} from './tiny-render-program-state.js';
import {
	uploadMaterialUniforms,
	uploadObjectUniforms
} from './tiny-render-uniforms.js';

export function drawRenderMesh(renderer, mesh, projectionView, transparent) {
	const resource = renderer.buffers.forMesh(mesh);
	if (!resource) return;
	const skinned = isSkinned(mesh, resource);
	const kind = skinned ? 'skin' : 'rigid';
	const model = mesh.matrixWorld || renderer.identityMatrix;

	applyCull(renderer, mesh, transparent);
	const { locations, program } = reclaimRenderProgram(renderer, kind);
	ensureFrameUniforms(renderer, program, locations);
	renderer.buffers.bindMesh(resource, locations, skinned);
	bindSkinBranch(renderer, locations, mesh, skinned);
	uploadObjectUniforms(
		renderer,
		locations,
		model,
		writeMvp(renderer, projectionView, model)
	);
	if (renderer.materialState.needsUpload(mesh, resource)) {
		uploadMaterialUniforms(renderer, locations, mesh, resource);
	}
	renderer.textures.bind(locations, mesh.material, renderer.stats);
	issueDraw(renderer, resource);
	recordDraw(renderer, mesh, resource, skinned, transparent);
}

function isSkinned(mesh, resource) {
	return Boolean(
		mesh.isSkinnedMesh
		&& mesh.skeleton
		&& resource.attributes.joints
		&& resource.attributes.weights
	);
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
