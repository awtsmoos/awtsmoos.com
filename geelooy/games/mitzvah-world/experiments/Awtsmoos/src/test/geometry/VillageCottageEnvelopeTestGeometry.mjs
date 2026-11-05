// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopeTestGeometry.mjs
 * @description Keeps reusable envelope-geometry measurements outside the focused cottage contract tests.
 * The Awtsmoos lets every polygon and height testify through small mathematical vessels;
 * Awtsmoos.com keeps the behavioral tests readable while preserving complete geometric proof across levels.
 */

export function isConvexFace(points) {
	const normal = newellNormal(points);
	let direction = 0;
	for (let index = 0; index < points.length; index += 1) {
		const previous = points[(index + points.length - 1) % points.length];
		const current = points[index];
		const next = points[(index + 1) % points.length];
		const turn = cross(subtract(current, previous), subtract(next, current));
		const sign = Math.sign(dot(turn, normal));
		if (!sign) {
			continue;
		}
		if (!direction) {
			direction = sign;
		}
		if (sign !== direction) {
			return false;
		}
	}
	return direction !== 0;
}

export function verticesAtY(vertices, target, tolerance = 0.000001) {
	return vertices.filter(([, y]) => Math.abs(y - target) <= tolerance);
}

export function minimumY(vertices) {
	return Math.min(...vertices.map(([, y]) => y));
}

export function horizontalSpan(vertices, center) {
	return Math.max(...vertices.map(([x]) => Math.abs(x - center)));
}

export function geometryValuesClose(actual, expected, tolerance = 0.000001) {
	return Math.abs(actual - expected) <= tolerance;
}

function newellNormal(points) {
	return points.reduce((normal, point, index) => {
		const next = points[(index + 1) % points.length];
		return [
			normal[0] + (point[1] - next[1]) * (point[2] + next[2]),
			normal[1] + (point[2] - next[2]) * (point[0] + next[0]),
			normal[2] + (point[0] - next[0]) * (point[1] + next[1])
		];
	}, [0, 0, 0]);
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot(left, right) {
	return left.reduce((total, value, index) => {
		return total + value * right[index];
	}, 0);
}
