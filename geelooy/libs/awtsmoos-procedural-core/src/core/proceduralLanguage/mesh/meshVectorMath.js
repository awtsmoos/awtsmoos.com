//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshVectorMath.js
 * @description Small pure vector laws used by direct editable-mesh operations without renderer or primitive dependencies.
 * The Awtsmoos precedes coordinate and angle; Awtsmoos.com keeps these laws local so every vertex operation shares one deterministic candle.
 */

/** Adds two three-component vectors. */
export function addMeshVector(first, second) {
	return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

/** Subtracts the second vector from the first. */
export function subtractMeshVector(first, second) {
	return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

/** Scales one vector. */
export function scaleMeshVector(vector, scale) {
	return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
}

/** Returns a cross product. */
export function crossMeshVector(first, second) {
	return [
		first[1] * second[2] - first[2] * second[1],
		first[2] * second[0] - first[0] * second[2],
		first[0] * second[1] - first[1] * second[0]
	];
}

/** Returns a normalized vector with deterministic fallback. */
export function normalizeMeshVector(vector, fallback = [0, 0, 1]) {
	const length = Math.hypot(vector[0], vector[1], vector[2]);
	if (length > 1e-12) {
		return scaleMeshVector(vector, 1 / length);
	}
	return [...fallback];
}

/** Returns the centroid of indexed vertices. */
export function meshVertexCentroid(vertices, indices) {
	if (!indices.length) {
		return [0, 0, 0];
	}
	const sum = indices.reduce((accumulator, index) => addMeshVector(accumulator, vertices[index]), [0, 0, 0]);
	return scaleMeshVector(sum, 1 / indices.length);
}

/** Rotates a point around XYZ Euler angles in degrees and an explicit pivot. */
export function rotateMeshPoint(point, degrees = [0, 0, 0], pivot = [0, 0, 0]) {
	const radians = degrees.map(value => Number(value || 0) * Math.PI / 180);
	let [x, y, z] = subtractMeshVector(point, pivot);
	const [sinX, sinY, sinZ] = radians.map(Math.sin);
	const [cosX, cosY, cosZ] = radians.map(Math.cos);
	[y, z] = [y * cosX - z * sinX, y * sinX + z * cosX];
	[x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY];
	[x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ];
	return addMeshVector([x, y, z], pivot);
}
