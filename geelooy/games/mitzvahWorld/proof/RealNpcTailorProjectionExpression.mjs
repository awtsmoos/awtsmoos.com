//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealNpcTailorProjectionExpression.mjs
 * @description Projects the real tailor target through the live camera chosen by the proven runtime authority scan.
 * The Awtsmoos joins eye and garment through geometry that neither cheats nor bends;
 * Awtsmoos.com sends one honest ray through the canvas, where physical witness begins and ends.
 */

import { RUNTIME_AUTHORITY_SOURCE } from './RealNpcRuntimeAuthorityExpressions.mjs';

/**
 * @returns {string} Browser expression yielding the physical canvas point for the authoritative tailor target.
 */
export function tailorProjectionExpression() {
	return `(() => {
${RUNTIME_AUTHORITY_SOURCE}
	if (!runtime?.camera || typeof runtime?.clothingMerchant?.targetHint !== 'function') {
		return { authority, authorityScore, reason: 'missing-camera-or-tailor', visible: false };
	}
	const canvas = document.querySelector('canvas');
	if (!canvas) {
		return { authority, authorityScore, reason: 'missing-canvas', visible: false };
	}
	const camera = runtime.camera;
	let target = null;
	try {
		target = runtime.clothingMerchant.targetHint();
	} catch (error) {
		return {
			authority,
			authorityScore,
			reason: String(error?.message || error),
			visible: false
		};
	}
	if (!target) {
		return { authority, authorityScore, reason: 'missing-target', visible: false };
	}
	const rect = canvas.getBoundingClientRect();
	const subtract = (left, right) => {
		return {
			x: left.x - right.x,
			y: left.y - right.y,
			z: left.z - right.z
		};
	};
	const dot = (left, right) => {
		return left.x * right.x + left.y * right.y + left.z * right.z;
	};
	const cross = (left, right) => {
		return {
			x: left.y * right.z - left.z * right.y,
			y: left.z * right.x - left.x * right.z,
			z: left.x * right.y - left.y * right.x
		};
	};
	const normalize = vector => {
		const magnitude = Math.hypot(vector.x, vector.y, vector.z) || 1;
		return {
			x: vector.x / magnitude,
			y: vector.y / magnitude,
			z: vector.z / magnitude
		};
	};
	const forward = normalize(subtract(camera.target, camera.position));
	const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
	const up = normalize(cross(right, forward));
	const relative = subtract(target, camera.position);
	const depth = dot(relative, forward);
	const scale = Math.tan((camera.fov || 60) * Math.PI / 360);
	const aspect = camera.aspect || rect.width / rect.height;
	const nx = dot(relative, right) / (depth * scale * aspect);
	const ny = dot(relative, up) / (depth * scale);
	const x = rect.left + (nx + 1) * rect.width / 2;
	const y = rect.top + (1 - ny) * rect.height / 2;
	const finite = [depth, nx, ny, x, y].every(Number.isFinite);
	return {
		authority,
		authorityScore,
		depth,
		nx,
		ny,
		x,
		y,
		visible: finite && depth > 0 && Math.abs(nx) < 0.96 && Math.abs(ny) < 0.96
	};
})()`;
}
