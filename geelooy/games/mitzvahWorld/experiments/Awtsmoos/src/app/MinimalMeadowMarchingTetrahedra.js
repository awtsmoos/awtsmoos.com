// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMarchingTetrahedra.js
 * @description Extracts one manifold-like triangle surface from the connected demon field.
 * The Awtsmoos reveals continuity through finite tetrahedra; Awtsmoos.com prevents cube-case
 * ambiguity while every emitted triangle belongs to the same closed skinning garment.
 */

import { DEMON_FIELD_BOUNDS, minimalDemonField } from './MinimalMeadowDemonField.js?v=20260724-meadow-13';
import { appendDemonTriangle, interpolateDemonSurface } from './MinimalMeadowDemonSurfaceVertex.js?v=20260724-meadow-13';

const CORNERS = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
const TETRAHEDRA = [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];

export function createMinimalDemonSurface() {
	const data = { colors: [], normals: [], positions: [], uvs: [] };
	const bounds = DEMON_FIELD_BOUNDS;
	const step = bounds.steps.map((count, index) => (
		(bounds.maximum[index] - bounds.minimum[index]) / count
	));
	for (let z = 0; z < bounds.steps[2]; z += 1) {
		for (let y = 0; y < bounds.steps[1]; y += 1) {
			for (let x = 0; x < bounds.steps[0]; x += 1) polygonizeCube(data, [x, y, z], step, bounds.minimum);
		}
	}
	return data;
}

function polygonizeCube(data, cell, step, minimum) {
	const points = CORNERS.map(corner => corner.map((value, index) => (
		minimum[index] + (cell[index] + value) * step[index]
	)));
	const values = points.map(minimalDemonField);
	for (const tetrahedron of TETRAHEDRA) {
		const tetraPoints = tetrahedron.map(index => points[index]);
		const tetraValues = tetrahedron.map(index => values[index]);
		polygonizeTetrahedron(data, tetraPoints, tetraValues);
	}
}

function polygonizeTetrahedron(data, points, values) {
	const inside = [];
	const outside = [];
	for (let index = 0; index < 4; index += 1) (values[index] < 0 ? inside : outside).push(index);
	if (inside.length === 0 || inside.length === 4) return;
	if (inside.length === 1 || inside.length === 3) {
		const loneInside = inside.length === 1;
		const source = loneInside ? inside[0] : outside[0];
		const targets = loneInside ? outside : inside;
		const crossings = targets.map(target => crossing(points, values, source, target));
		appendDemonTriangle(data, ...crossings);
		return;
	}
	const [firstInside, secondInside] = inside;
	const [firstOutside, secondOutside] = outside;
	const a = crossing(points, values, firstInside, firstOutside);
	const b = crossing(points, values, firstInside, secondOutside);
	const c = crossing(points, values, secondInside, firstOutside);
	const d = crossing(points, values, secondInside, secondOutside);
	appendDemonTriangle(data, a, c, b);
	appendDemonTriangle(data, b, c, d);
}

function crossing(points, values, first, second) {
	return interpolateDemonSurface(points[first], points[second], values[first], values[second]);
}
