// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frame.js
 * @description Renders one camera-culled, exact-state-ordered frame with measured continuity.
 * The Awtsmoos recreates the whole view in one instant; Awtsmoos.com measures each
 * declaration so unchanged GPU state can rest while every visible form remains complete.
 */

import { lookAt, multiply, perspective } from './tiny-math.js';
import { collectMeshes } from './tiny-render-draw-list.js';
import { drawRenderMesh } from './tiny-render-mesh.js';
import { drawSkeleton } from './tiny-render-skeleton.js';
import { collectWorldMatrices } from './tiny-skin-system.js';

export function renderFrame(renderer, scene, camera) {
	const gl = renderer.gl;
	renderer.frameToken += 1;
	renderer.frameCameraPosition = {
		x: camera.position.x,
		y: camera.position.y,
		z: camera.position.z
	};
	renderer.worldByNode = collectWorldMatrices(scene);
	const renderList = collectMeshes(scene, camera, renderer.options);
	renderer.stats = createFrameStats(renderer, renderList);
	renderer.buffers.beginFrame(renderer.stats);
	renderer.materialState.beginFrame(renderer.stats);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(...renderer.clearColor);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionView = projectionViewMatrix(camera);
	drawOpaquePass(renderer, renderList.opaque, projectionView);
	drawTransparentPass(renderer, renderList.transparent, projectionView);
	drawSkeletonPass(renderer, scene, projectionView);
}

function projectionViewMatrix(camera) {
	const projection = perspective(camera.fov, camera.aspect || 1, camera.near, camera.far);
	const view = lookAt(camera.position.toArray(), camera.target || [0, 0, 4]);
	return multiply(projection, view);
}

function drawOpaquePass(renderer, meshes, projectionView) {
	const gl = renderer.gl;
	gl.disable(gl.BLEND);
	gl.depthMask(true);
	for (const mesh of meshes) {
		drawRenderMesh(renderer, mesh, projectionView, false);
		renderer.stats.opaqueMeshes += 1;
	}
}

function drawTransparentPass(renderer, meshes, projectionView) {
	const gl = renderer.gl;
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.depthMask(false);
	for (const mesh of meshes) {
		drawRenderMesh(renderer, mesh, projectionView, true);
	}
	gl.depthMask(true);
	gl.disable(gl.BLEND);
}

function drawSkeletonPass(renderer, scene, projectionView) {
	renderer.gl.disable(renderer.gl.CULL_FACE);
	if (renderer.options.showSkeleton) {
		drawSkeleton(renderer, scene, projectionView);
	}
}

function createFrameStats(renderer, renderList) {
	return {
		culledBackfaceMeshes: 0,
		culledMeshes: renderList.culled,
		draws: 0,
		errors: renderer.errors,
		floatTexture: renderer.floatTexture,
		frameUniformUploads: 0,
		grassInteractor: { ...renderer.interactor },
		hiddenHelpers: renderList.hidden,
		jointMode: renderer.jointMode,
		jointsUploaded: 0,
		matrixNodes: renderer.worldByNode.stats || {},
		maxUniformJoints: renderer.maxUniformJoints,
		maxVertexTextures: renderer.maxVertexTextures,
		maxVertexUniformVectors: renderer.maxVertexUniformVectors,
		opaqueMeshes: 0,
		perMeshSkinUpdate: true,
		programSwitches: 0,
		reactiveGrassMeshes: 0,
		renderOrder: renderList.renderOrder,
		rigidMeshes: 0,
		sharedSkinPaletteCache: true,
		staticBatch: renderList.staticBatch || null,
		skinGpuUploadReuses: 0,
		skinGpuUploads: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0,
		skinTextureUploads: 0,
		skinUniformUploads: 0,
		skinnedMeshes: 0,
		transparentMeshes: 0,
		triangles: 0
	};
}
