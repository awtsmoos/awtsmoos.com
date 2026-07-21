// B"H
// Boruch Hashem
// Blessed is He
/** Global edge identities stitch finite cubes into one continuous indexed surface. */

import { buildVertexNormals } from "../geometry/buildVertexNormals.js";
import { gradientScalarGrid3d, normalizeGradient3d } from "./gradientGrid3d.js";
import { CUBE_EDGES, cubeCornerPoint, globalCubeEdgeKey } from "./cubeTopology.js";

function mixPoint(left, right, amount) {
	return left.map((value, axis) => value + (right[axis] - value) * amount);
}

export function createCubeEdgeVertexResolver(grid, isoValue, positions, vertexMap) {
	return (cubeCoordinate, cornerValues, edgeIndex) => {
		const key = globalCubeEdgeKey(cubeCoordinate, edgeIndex);
		if (vertexMap.has(key)) return vertexMap.get(key);
		const [cornerA, cornerB] = CUBE_EDGES[edgeIndex];
		const valueA = cornerValues[cornerA];
		const valueB = cornerValues[cornerB];
		const denominator = valueB - valueA;
		const amount = Math.abs(denominator) < 1e-12
			? 0.5
			: Math.max(0, Math.min(1, (isoValue - valueA) / denominator));
		const point = mixPoint(
			cubeCornerPoint(grid, cubeCoordinate, cornerA),
			cubeCornerPoint(grid, cubeCoordinate, cornerB),
			amount
		);
		const index = positions.length / 3;
		positions.push(...point);
		vertexMap.set(key, index);
		return index;
	};
}

function pointAt(positions, index) {
	return positions.slice(index * 3, index * 3 + 3);
}

export function orientTriangleByGradient(grid, positions, triangle) {
	const [a, b, c] = triangle.map(index => pointAt(positions, index));
	const ab = b.map((value, axis) => value - a[axis]);
	const ac = c.map((value, axis) => value - a[axis]);
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const center = a.map((value, axis) => (value + b[axis] + c[axis]) / 3);
	const gradient = gradientScalarGrid3d(grid, center, grid.cellSize * 0.5);
	const alignment = normal.reduce((sum, value, axis) => sum + value * gradient[axis], 0);
	return alignment < 0 ? [triangle[0], triangle[2], triangle[1]] : triangle;
}

export function createIsosurfaceNormals(grid, positions, indices) {
	const normals = [];
	let nonZero = false;
	for (let offset = 0; offset < positions.length; offset += 3) {
		const normal = normalizeGradient3d(gradientScalarGrid3d(
			grid,
			positions.slice(offset, offset + 3),
			grid.cellSize * 0.5
		));
		nonZero ||= Math.hypot(...normal) > 0;
		normals.push(...normal);
	}
	return nonZero ? normals : buildVertexNormals(positions, indices);
}
