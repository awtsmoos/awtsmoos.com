// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-casters.js
 * @description Dispatches one caster to its depth path: instanced, rigid, or skinned.
 * The Awtsmoos weighs every vessel in the garment it truly wears; Awtsmoos.com sends
 * fields through instancing, houses through the rigid path, and the Chossid through
 * the skinned path, all by hand so depth layouts never poison the main VAO cache.
 */

import {
	isInstancedMesh,
	instanceCountFor
} from './tiny-instancing.js';
import { applyCull } from './tiny-render-mesh-helpers.js';
import { drawInstancedCasterDepth } from './tiny-render-shadow-instanced.js';
import { bindSkin } from './tiny-render-skin.js';
import { drawMode } from './tiny-render-webgl-utils.js';

/** Draws one caster as depth; reports casters and instances for frame stats. */
export function drawCasterDepth(renderer, mesh, shadowMatrix) {
	const variants = mesh.userData?.instancedVariants;
	if (Array.isArray(variants) && variants.length && renderer.instancing?.supported) {
		let instances = 0;
		for (const variant of variants) {
			instances += drawInstancedCasterDepth(renderer, variant, mesh, shadowMatrix);
		}
		return { casters: variants.length, instances };
	}
	if (isInstancedMesh(mesh) && renderer.instancing?.supported) {
		const count = instanceCountFor(mesh);
		drawInstancedCasterDepth(renderer, mesh, mesh, shadowMatrix);
		return { casters: 1, instances: count };
	}
	drawRigidOrSkinnedCasterDepth(renderer, mesh, mesh, shadowMatrix);
	return { casters: 1, instances: 0 };
}

function drawRigidOrSkinnedCasterDepth(renderer, geometryMesh, materialMesh, shadowMatrix) {
	const resource = renderer.buffers.forMesh(geometryMesh);
	if (!resource) return;
	const skinned = isSkinnedCaster(geometryMesh, resource);
	const name = skinned ? 'depthSkinned' : 'depthRigid';
	const program = renderer.programs[name];
	const locations = renderer.loc[name];
	if (!program || !locations) return;
	renderer.gl.useProgram(program);
	renderer.activeProgram = program;
	applyCull(renderer, materialMesh, false);
	// Manual path only: never let depth layouts poison the shared VAO cache.
	renderer.buffers.vertexArrays.releaseToDefault();
	renderer.buffers.manual.invalidate();
	renderer.buffers.manual.bind(resource, locations, skinned);
	if (skinned) bindDepthSkin(renderer, locations, geometryMesh);
	uploadDepthMvp(renderer, locations, shadowMatrix, materialMesh.matrixWorld);
	const gl = renderer.gl;
	const mode = drawMode(gl, resource.mode);
	if (resource.index) {
		gl.drawElements(mode, resource.count, resource.indexType, 0);
	} else {
		gl.drawArrays(mode, 0, resource.count);
	}
	renderer.buffers.manual.invalidate();
}

function isSkinnedCaster(mesh, resource) {
	return Boolean(
		mesh.isSkinnedMesh
		&& mesh.skeleton
		&& resource.attributes.joints
		&& resource.attributes.weights
	);
}

/** Uploads joint palette for depth without inflating the main-pass skin counters. */
function bindDepthSkin(renderer, locations, mesh) {
	const stats = renderer.stats;
	const skinnedBefore = stats.skinnedMeshes || 0;
	if (locations.useSkin) {
		renderer.gl.uniform1i(locations.useSkin, 1);
	}
	bindSkin(renderer, locations, mesh);
	const drawn = (stats.skinnedMeshes || 0) - skinnedBefore;
	stats.shadowSkinnedCasters = (stats.shadowSkinnedCasters || 0) + drawn;
	stats.skinnedMeshes = skinnedBefore;
}

function uploadDepthMvp(renderer, locations, shadowMatrix, model) {
	renderer._depthMvp ||= new Float32Array(16);
	multiplyInto(renderer._depthMvp, shadowMatrix, model || renderer.identityMatrix);
	renderer.gl.uniformMatrix4fv(locations.depthMvp, false, renderer._depthMvp);
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
