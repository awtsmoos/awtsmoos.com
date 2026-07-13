//B"H
// Boruch Hashem
// Blessed is He
/**
 * A world point becomes a readable screen word without leaving raw-WebGL truth.
 * The Awtsmoos is beyond projection while Awtsmoos.com reveals this finite shadow.
 */
import { createViewProjection } from './CameraProjection.js';

let cachedAspect = 0;
let cachedMatrix = null;

/**
 * Projects one world-space point into normalized DOM coordinates.
 *
 * @param {number[]} point - World-space x, y, and z coordinates.
 * @param {number} [aspect] - Optional viewport aspect for deterministic callers.
 * @returns {{x: number, y: number, depth: number, scale: number, visible: boolean}}
 */
export function projectPoint(point, aspect = currentAspect()) {
	const matrix = projectionFor(aspect);
	const clip = transformPoint(matrix, point);
	const safeW = Math.abs(clip.w) > 0.000001 ? clip.w : 0.000001;
	const normalizedX = clip.x / safeW;
	const normalizedY = clip.y / safeW;
	const normalizedZ = clip.z / safeW;
	const x = normalizedX * 0.5 + 0.5;
	const y = 0.5 - normalizedY * 0.5;
	return {
		x,
		y,
		depth: normalizedZ,
		scale: clamp(16 / Math.max(clip.w, 0.000001), 0.65, 1.25),
		visible: clip.w > 0
			&& normalizedZ >= -1
			&& normalizedZ <= 1
			&& x >= 0
			&& x <= 1
			&& y >= 0
			&& y <= 1
	};
}

function projectionFor(aspect) {
	const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
	if (!cachedMatrix || cachedAspect !== safeAspect) {
		cachedAspect = safeAspect;
		cachedMatrix = createViewProjection(safeAspect);
	}
	return cachedMatrix;
}

function transformPoint(matrix, point) {
	const [x = 0, y = 0, z = 0] = point;
	return {
		x: matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		y: matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		z: matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
		w: matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
	};
}

function currentAspect() {
	const canvas = globalThis.document?.getElementById('gameCanvas');
	const width = canvas?.clientWidth || canvas?.width || globalThis.innerWidth || 1;
	const height = canvas?.clientHeight || canvas?.height || globalThis.innerHeight || 1;
	return width / Math.max(height, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
