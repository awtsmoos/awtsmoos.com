// B"H
import {
	lookAt,
	multiply,
	perspective
} from './tiny-math.js';
import { collectMeshes } from './tiny-render-draw-list.js';
import { drawRenderMesh } from './tiny-render-mesh.js';
import { drawSkeleton } from './tiny-render-skeleton.js';
import { collectWorldMatrices } from './tiny-skin-system.js';

export function renderFrame(renderer, scene, camera) {
	const gl = renderer.gl;
	renderer.worldByNode = collectWorldMatrices(scene);
	const list = collectMeshes(scene, renderer.options);
	renderer.stats = baseStats(renderer, list);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionView = multiply(
		perspective(camera.fov, camera.aspect || 1, camera.near, camera.far),
		lookAt(camera.position.toArray(), camera.target || [0, 0, 4])
	);
	gl.disable(gl.BLEND);
	gl.depthMask(true);
	for (const mesh of list.opaque) {
		drawRenderMesh(renderer, mesh, projectionView, false);
	}
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.depthMask(false);
	for (const mesh of list.transparent) {
		drawRenderMesh(renderer, mesh, projectionView, true);
	}
	gl.depthMask(true);
	gl.disable(gl.BLEND);
	gl.disable(gl.CULL_FACE);
	if (renderer.options.showSkeleton) {
		drawSkeleton(renderer, scene, projectionView);
	}
}

function baseStats(renderer, list) {
	return {
		draws: 0,
		triangles: 0,
		rigidMeshes: 0,
		transparentMeshes: 0,
		skinnedMeshes: 0,
		jointsUploaded: 0,
		culledBackfaceMeshes: 0,
		reactiveGrassMeshes: 0,
		hiddenHelpers: list.hidden,
		errors: renderer.errors,
		jointMode: renderer.jointMode,
		maxUniformJoints: renderer.maxUniformJoints,
		maxVertexUniformVectors: renderer.maxVertexUniformVectors,
		maxVertexTextures: renderer.maxVertexTextures,
		floatTexture: renderer.floatTexture,
		perMeshSkinUpdate: true,
		uniformPreferred: renderer.maxUniformJoints >= 72,
		grassInteractor: { ...renderer.interactor }
	};
}
