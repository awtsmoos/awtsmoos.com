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
import { drawInstancedMesh } from './tiny-render-instanced-mesh.js';
import { isInstancedMesh } from './tiny-instancing.js';
import {
	ensureFrameUniforms,
	reclaimRenderProgram
} from './tiny-render-program-state.js';
import {
	uploadMaterialUniforms,
	uploadObjectUniforms
} from './tiny-render-uniforms.js';

export function drawRenderMesh(renderer, mesh, projectionView, transparent) {
	// B"H: instanced vegetation/props take the GPU instancing path when available;
	// the merged CPU geometry remains the honest fallback when it is not.
	if (shouldDrawInstanced(renderer, mesh)) {
		try {
			if (drawInstancedMesh(renderer, mesh, projectionView, transparent)) return;
		} catch (error) {
			recordInstancedDrawError(renderer, mesh, error);
		}
	}
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

/** An instanced mesh takes the instanced path only when the GPU supports it. */
function shouldDrawInstanced(renderer, mesh) {
	if (!renderer.instancing?.supported) return false;
	if (!renderer.programs?.instanced) return false;
	if (isInstancedMesh(mesh)) return true;
	const variants = mesh?.userData?.instancedVariants;
	return Boolean(Array.isArray(variants) && variants.some(isInstancedMesh));
}

function recordInstancedDrawError(renderer, mesh, error) {
	const stats = renderer.stats;
	stats.meshDrawErrors = (stats.meshDrawErrors || 0) + 1;
	stats.lastMeshDrawError = {
		mesh: mesh?.name || '(unnamed)',
		message: error?.message || String(error)
	};
	renderer.errors = renderer.errors || [];
	renderer.errors.push(stats.lastMeshDrawError);
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
