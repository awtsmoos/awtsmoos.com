// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-instanced-mesh.js
 * @description Draws one geometry thousands of times through per-instance matrices.
 * The Awtsmoos does not rebuild the meadow for every blade; Awtsmoos.com binds one
 * tuft geometry, streams one matrix buffer with divisor stepping, and issues one
 * instanced call. The shared VAO cache is bypassed on purpose: instance buffers are
 * per-mesh, so they can never live inside a geometry-shared vertex array.
 */

import {
	INSTANCE_MATRIX_FLOATS,
	instanceCountFor
} from './tiny-instancing.js';
import {
	ensureFrameUniforms,
	reclaimRenderProgram
} from './tiny-render-program-state.js';
import {
	uploadMaterialUniforms,
	uploadObjectUniforms
} from './tiny-render-uniforms.js';
import { drawMode } from './tiny-render-webgl-utils.js';
import { writeMvp } from './tiny-render-mesh-helpers.js';

/** Draws an instanced mesh (or its instanced variants) through the instanced program. */
export function drawInstancedMesh(renderer, mesh, projectionView, transparent) {
	const instancing = renderer.instancing;
	if (!instancing?.supported) return false;
	const count = instanceCountFor(mesh);
	const variants = mesh.userData?.instancedVariants;
	if (count <= 0 && !variants?.length) return false;
	const { locations, program } = reclaimRenderProgram(renderer, 'instanced');
	ensureFrameUniforms(renderer, program, locations);
	if (variants?.length) {
		for (const variant of variants) {
			drawInstancedVariant(renderer, mesh, variant, projectionView, locations, transparent);
		}
		return true;
	}
	drawSingleInstanced(renderer, mesh, mesh, projectionView, locations, transparent, count);
	return true;
}

function drawInstancedVariant(renderer, parentMesh, variant, projectionView, locations, transparent) {
	const count = instanceCountFor(variant);
	if (count <= 0) return;
	const resource = renderer.buffers.forMesh(variant);
	if (!resource) return;
	drawSingleInstanced(renderer, variant, parentMesh, projectionView, locations, transparent, count, resource);
}

function drawSingleInstanced(
	renderer,
	geometryMesh,
	materialMesh,
	projectionView,
	locations,
	transparent,
	count,
	resource = null
) {
	const gl = renderer.gl;
	const instancing = renderer.instancing;
	const actual = resource || renderer.buffers.forMesh(geometryMesh);
	if (!actual) return;
	const model = materialMesh.matrixWorld || renderer.identityMatrix;

	// Bypass the shared VAO cache: instance buffers are per-mesh and must never
	// be baked into a geometry-shared vertex array.
	renderer.buffers.vertexArrays.releaseToDefault();
	renderer.buffers.manual.invalidate();
	renderer.buffers.manual.bind(actual, locations, false);

	const instanceBuffer = renderer.instanceBuffers.forMesh(geometryMesh);
	if (!instanceBuffer) return;
	bindInstanceAttributes(renderer, locations, instanceBuffer);

	uploadObjectUniforms(renderer, locations, model, writeMvp(renderer, projectionView, model));
	if (renderer.materialState.needsUpload(materialMesh, actual)) {
		uploadMaterialUniforms(renderer, locations, materialMesh, actual);
	}
	renderer.textures.bind(locations, materialMesh.material, renderer.stats);

	const mode = drawMode(gl, actual.mode);
	if (actual.index) {
		instancing.drawElementsInstanced(mode, actual.count, actual.indexType, 0, count);
	} else {
		instancing.drawArraysInstanced(mode, 0, actual.count, count);
	}
	unbindInstanceAttributes(renderer, locations);
	renderer.buffers.manual.invalidate();

	renderer.stats.draws += 1;
	renderer.stats.instancedDraws = (renderer.stats.instancedDraws || 0) + 1;
	renderer.stats.instancedMeshes = (renderer.stats.instancedMeshes || 0) + 1;
	renderer.stats.instancedInstances = (renderer.stats.instancedInstances || 0) + count;
	renderer.stats.rigidMeshes += 1;
	if (transparent) renderer.stats.transparentMeshes += 1;
	if (geometryMesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
		renderer.stats.reactiveGrassMeshes += 1;
	}
}

function bindInstanceAttributes(renderer, locations, buffer) {
	const gl = renderer.gl;
	const slots = locations.instanceMatrix || [];
	for (let column = 0; column < 4; column += 1) {
		const location = slots[column];
		if (!Number.isInteger(location) || location < 0) continue;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 4, gl.FLOAT, false, INSTANCE_MATRIX_FLOATS * 4, column * 4 * 4);
		renderer.instancing.vertexAttribDivisor(location, 1);
	}
}

function unbindInstanceAttributes(renderer, locations) {
	const gl = renderer.gl;
	const slots = locations.instanceMatrix || [];
	for (let column = 0; column < 4; column += 1) {
		const location = slots[column];
		if (!Number.isInteger(location) || location < 0) continue;
		renderer.instancing.vertexAttribDivisor(location, 0);
		gl.disableVertexAttribArray(location);
	}
}
