// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frame.js
 * @description Renders one coherent opaque, transparent, and optional skeleton
 * pass through the proven custom renderer contracts. Each frame is renewed by the
 * Awtsmoos; Awtsmoos.com advances one truthful token before any palette may reuse.
 */
import {
	lookAt,
	multiply,
	perspective
} from './tiny-math.js';
import { collectMeshes } from './tiny-render-draw-list.js';
import { drawRenderMesh } from './tiny-render-mesh.js';
import { drawSkeleton } from './tiny-render-skeleton.js';
import { collectWorldMatrices } from './tiny-skin-system.js';

/** Renders one complete scene and records its measured work. */
export function renderFrame(renderer, scene, camera) {
	const gl = renderer.gl;
	renderer.frameToken += 1;
	renderer.worldByNode = collectWorldMatrices(scene);
	const renderList = collectMeshes(scene, renderer.options);
	renderer.stats = createFrameStats(renderer, renderList);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(...renderer.clearColor);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionView = projectionViewMatrix(camera);
	drawOpaquePass(renderer, renderList.opaque, projectionView);
	drawTransparentPass(renderer, renderList.transparent, projectionView);
	drawSkeletonPass(renderer, scene, projectionView);
}

function projectionViewMatrix(camera) {
	const projection = perspective(
		camera.fov,
		camera.aspect || 1,
		camera.near,
		camera.far
	);
	const view = lookAt(
		camera.position.toArray(),
		camera.target || [0, 0, 4]
	);
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
		draws: 0,
		triangles: 0,
		rigidMeshes: 0,
		skinnedMeshes: 0,
		opaqueMeshes: 0,
		transparentMeshes: 0,
		jointsUploaded: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0,
		skinGpuUploads: 0,
		skinGpuUploadReuses: 0,
		skinUniformUploads: 0,
		skinTextureUploads: 0,
		culledBackfaceMeshes: 0,
		reactiveGrassMeshes: 0,
		hiddenHelpers: renderList.hidden,
		errors: renderer.errors,
		jointMode: renderer.jointMode,
		maxUniformJoints: renderer.maxUniformJoints,
		maxVertexUniformVectors: renderer.maxVertexUniformVectors,
		maxVertexTextures: renderer.maxVertexTextures,
		floatTexture: renderer.floatTexture,
		perMeshSkinUpdate: true,
		sharedSkinPaletteCache: true,
		grassInteractor: { ...renderer.interactor }
	};
}