// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-frame-matrices.js
 * @description Reuses projection, view, and projection-view storage while look-at basis math lives in its own vessel.
 * The Awtsmoos renews the eye and horizon while stable matrix keilim remember their place;
 * Awtsmoos.com lets perspective change without needless allocation, keeping each frame a measured grace.
 */

import { writeCameraViewMatrix } from "./tiny-camera-view-matrix.js";

/** @param {object} renderer Native renderer. @param {object} camera Active camera. */
export function updateFrameCameraPosition(renderer, camera) {
	renderer.frameCameraPosition ||= {
		x: 0,
		y: 0,
		z: 0
	};
	renderer.frameCameraPosition.x = camera.position.x;
	renderer.frameCameraPosition.y = camera.position.y;
	renderer.frameCameraPosition.z = camera.position.z;
}

/**
 * Resolves the reusable projection-view matrix for one frame.
 * @param {object} renderer Native renderer.
 * @param {object} camera Active camera.
 * @returns {Float32Array} Projection-view matrix.
 */
export function projectionViewMatrix(renderer, camera) {
	const cache = frameMatrixCache(renderer);
	const aspect = camera.aspect || 1;
	if (projectionChanged(cache, camera, aspect)) {
		writePerspective(
			cache.projection,
			camera.fov,
			aspect,
			camera.near,
			camera.far
		);
		rememberProjection(cache, camera, aspect);
	}
	writeCameraViewMatrix(cache.view, camera);
	multiplyFrameMatrices(
		cache.projectionView,
		cache.projection,
		cache.view
	);
	return cache.projectionView;
}

/** @param {object} renderer Native renderer. @returns {object} Stable matrix cache. */
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

/** @returns {boolean} Whether projection inputs changed. */
function projectionChanged(cache, camera, aspect) {
	return cache.fov !== camera.fov
		|| cache.aspect !== aspect
		|| cache.near !== camera.near
		|| cache.far !== camera.far;
}

/** Records the projection inputs after rebuilding the matrix. */
function rememberProjection(cache, camera, aspect) {
	cache.fov = camera.fov;
	cache.aspect = aspect;
	cache.near = camera.near;
	cache.far = camera.far;
}

/** Writes a column-major perspective matrix into reusable storage. */
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

/** Multiplies two column-major matrices into stable frame storage. */
function multiplyFrameMatrices(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		for (let row = 0; row < 4; row += 1) {
			target[offset + row] = left[row] * right[offset]
				+ left[row + 4] * right[offset + 1]
				+ left[row + 8] * right[offset + 2]
				+ left[row + 12] * right[offset + 3];
		}
	}
}
