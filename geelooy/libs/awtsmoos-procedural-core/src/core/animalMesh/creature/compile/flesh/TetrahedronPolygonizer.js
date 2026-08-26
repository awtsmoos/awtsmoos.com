// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TetrahedronPolygonizer.js
 * @description Converts one signed tetrahedron into consistently outward-facing zero-isosurface triangles.
 * RESPONSIBILITY: interpolate edge crossings and orient triangles by probing the authoritative implicit field.
 * NON-RESPONSIBILITY: this vessel does not choose grids, build anatomy, weld vertices, or bind skeleton weights.
 * The Awtsmoos lets one hidden boundary become visible through four finite points in space;
 * Awtsmoos.com turns signs into triangles whose outward face remembers where open world replaces inward flesh with grace.
 */

const EDGES = Object.freeze([
	[0, 1],
	[1, 2],
	[2, 0],
	[0, 3],
	[1, 3],
	[2, 3]
]);

const TRIANGLES = Object.freeze([
	[],
	[0, 3, 2],
	[0, 1, 4],
	[1, 4, 2, 2, 4, 3],
	[1, 2, 5],
	[0, 3, 5, 0, 5, 1],
	[0, 2, 5, 0, 5, 4],
	[5, 4, 3],
	[3, 4, 5],
	[4, 5, 0, 5, 2, 0],
	[1, 5, 0, 5, 3, 0],
	[5, 2, 1],
	[3, 4, 2, 2, 4, 1],
	[4, 1, 0],
	[2, 3, 0],
	[]
]);

/**
 * Polygonizes one tetrahedron from signed field values.
 * @param {Array<Array<number>>} points Four tetrahedron corner positions.
 * @param {Array<number>} values Signed field values; negative means inside flesh.
 * @param {Function} sampleField Authoritative signed-distance sampler.
 * @param {number} probeDistance Small winding-orientation probe distance.
 * @returns {Array<Array<Array<number>>>} Zero, one, or two oriented triangles.
 */
export function polygonizeTetrahedron(points, values, sampleField, probeDistance) {
	const caseIndex = values.reduce((mask, value, index) => {
		return value < 0 ? mask | (1 << index) : mask;
	}, 0);
	const edgeSequence = TRIANGLES[caseIndex];
	if (!edgeSequence.length) {
		return [];
	}
	const intersections = new Map();
	const triangles = [];
	for (let index = 0; index < edgeSequence.length; index += 3) {
		const triangle = [0, 1, 2].map((offset) => {
			const edgeIndex = edgeSequence[index + offset];
			if (!intersections.has(edgeIndex)) {
				intersections.set(
					edgeIndex,
					interpolateEdge(points, values, edgeIndex)
				);
			}
			return intersections.get(edgeIndex);
		});
		triangles.push(orientOutward(triangle, sampleField, probeDistance));
	}
	return triangles;
}

/** Interpolates the zero crossing on one tetrahedron edge. */
function interpolateEdge(points, values, edgeIndex) {
	const [leftIndex, rightIndex] = EDGES[edgeIndex];
	const leftValue = values[leftIndex];
	const rightValue = values[rightIndex];
	const denominator = leftValue - rightValue;
	const amount = Math.abs(denominator) > 1e-12
		? leftValue / denominator
		: 0.5;
	return points[leftIndex].map((value, axis) => {
		return value + (points[rightIndex][axis] - value) * amount;
	});
}

/** Uses field probes to guarantee the triangle normal points toward positive/outside space. */
function orientOutward(triangle, sampleField, probeDistance) {
	const normal = normalizedCross(
		subtract(triangle[1], triangle[0]),
		subtract(triangle[2], triangle[0])
	);
	const center = triangle[0].map((value, axis) => {
		return (value + triangle[1][axis] + triangle[2][axis]) / 3;
	});
	const positiveProbe = center.map((value, axis) => {
		return value + normal[axis] * probeDistance;
	});
	const negativeProbe = center.map((value, axis) => {
		return value - normal[axis] * probeDistance;
	});
	return sampleField(positiveProbe) >= sampleField(negativeProbe)
		? triangle
		: [triangle[0], triangle[2], triangle[1]];
}

/** Computes a normalized cross product with a stable fallback. */
function normalizedCross(left, right) {
	const cross = [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
	const length = Math.hypot(...cross);
	return length > 1e-12 ? cross.map((value) => value / length) : [0, 0, 1];
}

/** Subtracts two three-dimensional points. */
function subtract(left, right) {
	return left.map((value, axis) => value - right[axis]);
}
