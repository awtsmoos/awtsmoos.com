// B"H
import { multiply } from './tiny-math.js';
import { triangleCountForMode } from './tiny-render-draw-list.js';
import { bindSkin } from './tiny-render-skin.js';
import { uploadCommonUniforms } from './tiny-render-uniforms.js';
import { drawMode } from './tiny-render-webgl-utils.js';

export function drawRenderMesh(renderer, mesh, projectionView, transparent) {
	const buffers = renderer.buffers.forMesh(mesh);
	if (!buffers) return;
	const skinned = mesh.isSkinnedMesh
		&& mesh.skeleton
		&& buffers.joints
		&& buffers.weights;
	const kind = skinned ? 'skin' : 'rigid';
	const programLocations = renderer.loc[kind];
	const model = mesh.matrixWorld || renderer.identityMatrix;
	applyCull(renderer, mesh, transparent);
	renderer.gl.useProgram(renderer.programs[kind]);
	bindCommonAttributes(renderer, programLocations, buffers);
	if (skinned) bindSkin(renderer, programLocations, mesh, buffers);
	uploadCommonUniforms(
		renderer,
		programLocations,
		mesh,
		buffers,
		model,
		multiply(projectionView, model)
	);
	renderer.textures.bind(programLocations, mesh.material, renderer.stats);
	issueDraw(renderer, buffers);
	renderer.stats.draws += 1;
	renderer.stats.triangles += triangleCountForMode(buffers.mode, buffers.count);
	if (!skinned) renderer.stats.rigidMeshes += 1;
	if (transparent) renderer.stats.transparentMeshes += 1;
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
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
		gl.drawElements(mode, buffers.count, buffers.indexType, 0);
	} else {
		gl.drawArrays(mode, 0, buffers.count);
	}
}
