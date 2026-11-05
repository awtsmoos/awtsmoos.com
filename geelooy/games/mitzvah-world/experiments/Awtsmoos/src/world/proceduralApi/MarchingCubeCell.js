// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MarchingCubeCell.js
 * @description Polygonizes each voxel cube through six deterministic tetrahedra,
 * avoiding ambiguous cube faces while preserving a watertight local isosurface.
 */
import { addTriangle } from './WorldGeometry.js';

const TETRAHEDRA = Object.freeze([
	[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6],
	[0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]
]);

export function polygonizeCube(geometry, points, values, isoLevel = 0) {
	for (const tetrahedron of TETRAHEDRA) {
		polygonizeTetrahedron(
			geometry,
			tetrahedron.map(index => points[index]),
			tetrahedron.map(index => values[index]),
			isoLevel
		);
	}
}

function polygonizeTetrahedron(geometry, points, values, isoLevel) {
	const inside = [];
	const outside = [];
	for (let index = 0; index < 4; index += 1) {
		(values[index] >= isoLevel ? inside : outside).push(index);
	}
	if (inside.length === 0 || inside.length === 4) return;
	if (inside.length === 1 || inside.length === 3) {
		const reverse = inside.length === 3;
		const single = reverse ? outside[0] : inside[0];
		const others = reverse ? inside : outside;
		const triangle = others.map(index => interpolate(points[single], points[index], values[single], values[index], isoLevel));
		addTriangle(geometry, ...(reverse ? [triangle[0], triangle[2], triangle[1]] : triangle));
		return;
	}
	const [first, second] = inside;
	const [third, fourth] = outside;
	const a = interpolate(points[first], points[third], values[first], values[third], isoLevel);
	const b = interpolate(points[first], points[fourth], values[first], values[fourth], isoLevel);
	const c = interpolate(points[second], points[third], values[second], values[third], isoLevel);
	const d = interpolate(points[second], points[fourth], values[second], values[fourth], isoLevel);
	addTriangle(geometry, a, b, c);
	addTriangle(geometry, b, d, c);
}

function interpolate(a, b, valueA, valueB, isoLevel) {
	const denominator = valueB - valueA;
	const amount = Math.abs(denominator) < 1e-9 ? 0.5 : (isoLevel - valueA) / denominator;
	return a.map((value, axis) => value + (b[axis] - value) * amount);
}
