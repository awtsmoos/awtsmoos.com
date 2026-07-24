// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonSurfaceVertex.js
 * @description Interpolates implicit crossings and derives outward normal, color, and UV truth.
 * The Awtsmoos gives every boundary point direction and garment; Awtsmoos.com keeps a closed
 * demon surface readable without transparent holes, detached eyes, or remembered polygon normals.
 */

import { minimalDemonField, minimalDemonSurfaceColor } from './MinimalMeadowDemonField.js?v=20260724-meadow-13';

export function interpolateDemonSurface(first, second, firstValue, secondValue) {
	const denominator = firstValue - secondValue;
	const ratio = Math.abs(denominator) < 0.000001 ? 0.5 : firstValue / denominator;
	return first.map((value, index) => value + (second[index] - value) * ratio);
}

export function appendDemonTriangle(data, first, second, third) {
	const normal = demonSurfaceNormal(first);
	const cross = triangleCross(first, second, third);
	const ordered = dot(cross, normal) < 0 ? [first, third, second] : [first, second, third];
	for (const point of ordered) appendDemonVertex(data, point);
}

function appendDemonVertex(data, point) {
	const normal = demonSurfaceNormal(point);
	data.positions.push(...point);
	data.normals.push(...normal);
	data.colors.push(...minimalDemonSurfaceColor(point));
	data.uvs.push(0.5 + Math.atan2(point[2], point[0]) / (Math.PI * 2), point[1] / 4.7 + 0.16);
}

function demonSurfaceNormal(point) {
	const epsilon = 0.012;
	const x = minimalDemonField([point[0] + epsilon, point[1], point[2]])
		- minimalDemonField([point[0] - epsilon, point[1], point[2]]);
	const y = minimalDemonField([point[0], point[1] + epsilon, point[2]])
		- minimalDemonField([point[0], point[1] - epsilon, point[2]]);
	const z = minimalDemonField([point[0], point[1], point[2] + epsilon])
		- minimalDemonField([point[0], point[1], point[2] - epsilon]);
	const length = Math.max(0.000001, Math.hypot(x, y, z));
	return [x / length, y / length, z / length];
}

function triangleCross(first, second, third) {
	const a = second.map((value, index) => value - first[index]);
	const b = third.map((value, index) => value - first[index]);
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(first, second) {
	return first.reduce((sum, value, index) => sum + value * second[index], 0);
}
