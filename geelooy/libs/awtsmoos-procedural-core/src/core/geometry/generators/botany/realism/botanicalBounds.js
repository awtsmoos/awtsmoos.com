// B"H
// Boruch Hashem
// Blessed is He
/** Botanical bounds and moments reveal scale for biomechanics and optics. */

/** Measures aggregate bounds, center, height, spread, and vertex count. */
export function measureBotanicalBounds(plant) {
	const vertices = plant.parts.flatMap((part) => part.geometry.vertices);
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	const center = [0, 0, 0];
	for (const point of vertices) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], point[axis]);
			maximum[axis] = Math.max(maximum[axis], point[axis]);
			center[axis] += point[axis];
		}
	}
	if (!vertices.length) {
		return Object.freeze({
			minimum: [0, 0, 0],
			maximum: [0, 0, 0],
			center: [0, 0, 0],
			height: 0,
			spread: 0,
			vertexCount: 0
		});
	}
	const normalizedCenter = center.map((value) => value / vertices.length);
	return Object.freeze({
		minimum: Object.freeze(minimum),
		maximum: Object.freeze(maximum),
		center: Object.freeze(normalizedCenter),
		height: maximum[1] - minimum[1],
		spread: Math.max(maximum[0] - minimum[0], maximum[2] - minimum[2]),
		vertexCount: vertices.length
	});
}
