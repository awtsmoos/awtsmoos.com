// B"H
// Boruch Hashem
// Blessed is He
/** Cube edges and faces give the isosurface one deterministic local alphabet. */

export const CUBE_CORNERS = Object.freeze([
	Object.freeze([0, 0, 0]), Object.freeze([1, 0, 0]),
	Object.freeze([1, 1, 0]), Object.freeze([0, 1, 0]),
	Object.freeze([0, 0, 1]), Object.freeze([1, 0, 1]),
	Object.freeze([1, 1, 1]), Object.freeze([0, 1, 1])
]);

export const CUBE_EDGES = Object.freeze([
	Object.freeze([0, 1]), Object.freeze([1, 2]),
	Object.freeze([2, 3]), Object.freeze([3, 0]),
	Object.freeze([4, 5]), Object.freeze([5, 6]),
	Object.freeze([6, 7]), Object.freeze([7, 4]),
	Object.freeze([0, 4]), Object.freeze([1, 5]),
	Object.freeze([2, 6]), Object.freeze([3, 7])
]);

export const CUBE_FACES = Object.freeze([
	Object.freeze({ corners: [0, 1, 2, 3], edges: [0, 1, 2, 3] }),
	Object.freeze({ corners: [4, 5, 6, 7], edges: [4, 5, 6, 7] }),
	Object.freeze({ corners: [0, 1, 5, 4], edges: [0, 9, 4, 8] }),
	Object.freeze({ corners: [1, 2, 6, 5], edges: [1, 10, 5, 9] }),
	Object.freeze({ corners: [2, 3, 7, 6], edges: [2, 11, 6, 10] }),
	Object.freeze({ corners: [3, 0, 4, 7], edges: [3, 8, 7, 11] })
]);

export function cubeCornerCoordinate(cubeCoordinate, cornerIndex) {
	return CUBE_CORNERS[cornerIndex].map((value, axis) => cubeCoordinate[axis] + value);
}

export function cubeCornerPoint(grid, cubeCoordinate, cornerIndex) {
	const coordinate = cubeCornerCoordinate(cubeCoordinate, cornerIndex);
	return coordinate.map((value, axis) => grid.origin[axis] + value * grid.cellSize);
}

function compareCoordinates(left, right) {
	for (let axis = 0; axis < 3; axis += 1) {
		if (left[axis] !== right[axis]) return left[axis] - right[axis];
	}
	return 0;
}

export function globalCubeEdgeKey(cubeCoordinate, edgeIndex) {
	const [cornerA, cornerB] = CUBE_EDGES[edgeIndex];
	const a = cubeCornerCoordinate(cubeCoordinate, cornerA);
	const b = cubeCornerCoordinate(cubeCoordinate, cornerB);
	const lower = compareCoordinates(a, b) <= 0 ? a : b;
	const axis = a.findIndex((value, index) => value !== b[index]);
	return `${axis}:${lower.join(":")}`;
}
