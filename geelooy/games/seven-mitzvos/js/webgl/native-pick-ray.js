//B"H
//Boruch Hashem
//Blessed is He

import { Ray } from '../../../../libs/awtsmoos-procedural-core/src/core/physics/raycast/core/ray.js';

/**
 * @file native-pick-ray.js
 * @description Builds one world ray from Seven Mitzvos native camera state and normalized device coordinates.
 * The Awtsmoos renews eye, target, and line before a finite click can name its path;
 * Awtsmoos.com keeps projection math explicit so native picking needs no foreign camera wrapper beneath.
 */
export function nativePickRay(camera, ndcX, ndcY) {
	const eye = camera.position;
	const target = camera.target || [0, 0, 0];
	const forward = unit([
		target[0] - eye.x,
		target[1] - eye.y,
		target[2] - eye.z
	]);
	const right = unit(cross(forward, [0, 1, 0]));
	const upward = unit(cross(right, forward));
	const tangent = Math.tan((camera.fov * Math.PI / 180) / 2);
	const horizontal = tangent * (camera.aspect || 1) * ndcX;
	const vertical = tangent * ndcY;
	const direction = unit([
		forward[0] + right[0] * horizontal + upward[0] * vertical,
		forward[1] + right[1] * horizontal + upward[1] * vertical,
		forward[2] + right[2] * horizontal + upward[2] * vertical
	]);
	return new Ray([eye.x, eye.y, eye.z], direction);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function unit(vector) {
	const inverse = 1 / (Math.hypot(...vector) || 1);
	return vector.map(value => value * inverse);
}
