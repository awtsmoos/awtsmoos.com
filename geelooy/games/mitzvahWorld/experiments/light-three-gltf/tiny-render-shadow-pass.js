// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-pass.js
 * @description Renders the sun depth pre-pass into the budgeted shadow map.
 * The Awtsmoos weighs every vessel before clothing it in light; Awtsmoos.com
 * draws casters once per frame with tiny depth-only programs, then the ordinary
 * lighting path reads the map back with a soft PCF lookup.
 *
 * The depth pass deliberately bypasses the shared VAO cache (which keys only by
 * resource and skin branch): depth attribute layouts must never leak into the
 * main pass's vertex arrays, so every caster binds through the manual path.
 */

import { bindSkin } from './tiny-render-skin.js';
import {
	INSTANCE_MATRIX_FLOATS,
	isInstancedMesh,
	instanceCountFor
} from './tiny-instancing.js';
import { applyCull } from './tiny-render-mesh-helpers.js';
import { drawMode, materialModeCode } from './tiny-render-webgl-utils.js';
import {
	computeShadowMatrix,
	ensureShadowResources,
	SHADOW_FRUSTUM_RADIUS
} from './tiny-shadow-map.js';

/** Runs the shadow depth pre-pass; returns false when shadows are off. */
export function renderShadowPass(renderer, meshes, camera) {
	const shadow = renderer.shadow;
	if (!shadow?.enabled || shadow.size <= 0) return false;
	if (!ensureShadowResources(renderer.gl, shadow)) return false;
	const gl = renderer.gl;
	const focus = shadowFocus(camera);
	computeShadowMatrix(
		renderer.environment.sunDirection,
		focus,
		SHADOW_FRUSTUM_RADIUS,
		shadow.matrix
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.framebuffer);
	gl.viewport(0, 0, shadow.size, shadow.size);
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	gl.disable(gl.BLEND);
	let casters = 0;
	let instances = 0;
	for (const mesh of meshes) {
		if (!isShadowCaster(mesh)) continue;
		try {
			const drawn = drawCasterDepth(renderer, mesh, shadow.matrix);
			casters += drawn.casters;
			instances += drawn.instances;
		} catch (error) {
			renderer.errors = renderer.errors || [];
			renderer.errors.push({
				mesh: mesh?.name || '(unnamed)',
				message: `shadow depth: ${error?.message || String(error)}`
			});
		}
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, renderer.canvas.width, renderer.canvas.height);
	renderer.stats.shadowCasters = casters;
	renderer.stats.shadowInstances = instances;
	renderer.stats.shadowMapSize = shadow.size;
	return true;
}

/** Shadow focus follows the camera target so texel density stays constant. */
function shadowFocus(camera) {
	const target = camera?.target;
	return {
		x: target?.[0] ?? camera?.position?.x ?? 0,
		y: target?.[1] ?? camera?.position?.y ?? 0,
		z: target?.[2] ?? camera?.position?.z ?? 4
	};
}

/** Sky, water, and opted-out meshes never cast. */
function isShadowCaster(mesh) {
	if (!mesh || mesh.userData?.castShadow === false) return false;
	const mode = materialModeCode(mesh);
	return mode !== 1 && mode !== 4;
}

function drawCasterDepth(renderer, mesh, shadowMatrix) {
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

function drawInstancedCasterDepth(renderer, geometryMesh, materialMesh, shadowMatrix) {
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
