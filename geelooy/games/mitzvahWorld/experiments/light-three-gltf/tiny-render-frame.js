// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frame.js
 * @description Renders one depth-correct frame through reusable camera matrix vessels.
 * The Awtsmoos recreates the whole view in one instant; Awtsmoos.com keeps projection,
 * view, world-map, and camera-position storage steady while every visible value renews.
 */

import { collectMeshes } from './tiny-render-draw-list.js';
import { recordGlStateCacheStats } from './tiny-render-gl-state-stats.js';
import { drawRenderMesh } from './tiny-render-mesh.js';
import { drawSkeleton } from './tiny-render-skeleton.js';
import { collectWorldMatrices } from './tiny-skin-system.js';

export function renderFrame(renderer, scene, camera) {
	const gl = renderer.gl;
	renderer.frameToken += 1;
	updateFrameCameraPosition(renderer, camera);
	renderer.worldByNode = collectWorldMatrices(scene, renderer.worldByNode);
	const renderList = collectMeshes(scene, camera, renderer.options);
	renderer.stats = createFrameStats(renderer, renderList);
	renderer.buffers.beginFrame(renderer.stats);
	renderer.materialState.beginFrame(renderer.stats);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(...renderer.clearColor);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const projectionView = projectionViewMatrix(renderer, camera);
	drawOpaquePass(renderer, renderList.opaque, projectionView);
	drawTransparentPass(renderer, renderList.transparent, projectionView);
	drawSkeletonPass(renderer, scene, projectionView);
	recordGlStateCacheStats(renderer);
}

function updateFrameCameraPosition(renderer, camera) {
	renderer.frameCameraPosition ||= { x: 0, y: 0, z: 0 };
	renderer.frameCameraPosition.x = camera.position.x;
	renderer.frameCameraPosition.y = camera.position.y;
	renderer.frameCameraPosition.z = camera.position.z;
}

function projectionViewMatrix(renderer, camera) {
	const cache = frameMatrixCache(renderer);
	const aspect = camera.aspect || 1;
	if (
		cache.fov !== camera.fov
		|| cache.aspect !== aspect
		|| cache.near !== camera.near
		|| cache.far !== camera.far
	) {
		writePerspective(
			cache.projection,
			camera.fov,
			aspect,
			camera.near,
			camera.far
		);
		cache.fov = camera.fov;
		cache.aspect = aspect;
		cache.near = camera.near;
		cache.far = camera.far;
	}
	writeLookAt(cache.view, camera);
	multiplyInto(cache.projectionView, cache.projection, cache.view);
	return cache.projectionView;
}

function frameMatrixCache(renderer) {
	if (!renderer._frameMatrixCache) {
		renderer._frameMatrixCache = {
			aspect: Number.NaN,
			far: Number.NaN,
			fov: Number.NaN,
			near: Number.NaN,
			projection: new Float32Array(16),
			projectionView: new Float32Array(16),
			view: new Float32Array(16)
		};
	}
	return renderer._frameMatrixCache;
}

function writePerspective(target, fovDegrees, aspect, near, far) {
	target.fill(0);
	const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
	const depth = 1 / (near - far);
	target[0] = factor / aspect;
	target[5] = factor;
	target[10] = (far + near) * depth;
	target[11] = -1;
	target[14] = 2 * far * near * depth;
}

function writeLookAt(target, camera) {
	const eyeX = camera.position.x;
	const eyeY = camera.position.y;
	const eyeZ = camera.position.z;
	const cameraTarget = camera.target;
	const targetX = cameraTarget?.[0] ?? 0;
	const targetY = cameraTarget?.[1] ?? 0;
	const targetZ = cameraTarget?.[2] ?? 4;
	const rawForwardX = eyeX - targetX;
	const rawForwardY = eyeY - targetY;
	const rawForwardZ = eyeZ - targetZ;
	const inverseForward = 1 / (
		Math.hypot(rawForwardX, rawForwardY, rawForwardZ) || 1
	);
	const forwardX = rawForwardX * inverseForward;
	const forwardY = rawForwardY * inverseForward;
	const forwardZ = rawForwardZ * inverseForward;
	const rawRightX = forwardZ;
	const rawRightZ = -forwardX;
	const inverseRight = 1 / (Math.hypot(rawRightX, 0, rawRightZ) || 1);
	const rightX = rawRightX * inverseRight;
	const rightY = 0;
	const rightZ = rawRightZ * inverseRight;
	const upwardX = forwardY * rightZ - forwardZ * rightY;
	const upwardY = forwardZ * rightX - forwardX * rightZ;
	const upwardZ = forwardX * rightY - forwardY * rightX;
	target[0] = rightX;
	target[1] = upwardX;
	target[2] = forwardX;
	target[3] = 0;
	target[4] = rightY;
	target[5] = upwardY;
	target[6] = forwardY;
	target[7] = 0;
	target[8] = rightZ;
	target[9] = upwardZ;
	target[10] = forwardZ;
	target[11] = 0;
	target[12] = -(rightX * eyeX + rightY * eyeY + rightZ * eyeZ);
	target[13] = -(upwardX * eyeX + upwardY * eyeY + upwardZ * eyeZ);
	target[14] = -(forwardX * eyeX + forwardY * eyeY + forwardZ * eyeZ);
	target[15] = 1;
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
	if (!meshes.length) return;
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
	if (!renderer.options.showSkeleton) return;
	renderer.gl.disable(renderer.gl.CULL_FACE);
	if (!drawSkeleton(renderer, scene, projectionView)) return;
	renderer.activeProgram = renderer.programs.rigid;
	renderer.materialState.previous = null;
}

function createFrameStats(renderer, renderList) {
	return {
		culledBackfaceMeshes: 0,
		culledMeshes: renderList.culled,
		draws: 0,
		errors: renderer.errors,
		floatTexture: renderer.floatTexture,
		frameUniformUploads: 0,
		grassInteractor: renderer.interactor,
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
