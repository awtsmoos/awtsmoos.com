// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonSurfaceVertex.js
 * @description Interpolates the implicit skin and writes normals, anatomical color, and bound UVs.
 * The Awtsmoos gives every boundary point direction and garment; Awtsmoos.com keeps eyes,
 * face, horns, claws, torso, arms, and legs readable without detached geometry or dark holes.
 */

import { minimalDemonField } from './MinimalMeadowDemonField.js?v=20260724-meadow-13';
import { readableDemonSurfaceColor } from './MinimalMeadowCreatureSurfaceRegions.js';

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

export function demonSurfaceUv(point) {
	return [
		0.5 + Math.atan2(point[2], point[0]) / (Math.PI * 2),
		point[1] / 4.7 + 0.16
	];
}

function appendDemonVertex(data, point) {
	data.positions.push(...point);
	data.normals.push(...demonSurfaceNormal(point));
	data.colors.push(...readableDemonSurfaceColor(point));
	data.uvs.push(...demonSurfaceUv(point));
}

function demonSurfaceNormal(point) {
	const epsilon = 0.012;
	const x = sampleOffset(point, 0, epsilon) - sampleOffset(point, 0, -epsilon);
	const y = sampleOffset(point, 1, epsilon) - sampleOffset(point, 1, -epsilon);
	const z = sampleOffset(point, 2, epsilon) - sampleOffset(point, 2, -epsilon);
	const length = Math.max(0.000001, Math.hypot(x, y, z));
	return [x / length, y / length, z / length];
}

function sampleOffset(point, axis, distance) {
	const sample = [...point];
	sample[axis] += distance;
	return minimalDemonField(sample);
}

function triangleCross(first, second, third) {
	const a = second.map((value, index) => value - first[index]);
	const b = third.map((value, index) => value - first[index]);
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(first, second) {
	return first.reduce((sum, value, index) => sum + value * second[index], 0);
}
