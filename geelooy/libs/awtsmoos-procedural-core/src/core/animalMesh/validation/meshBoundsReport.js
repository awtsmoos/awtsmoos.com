// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function boundsForPositions(positions) {
	const minimum = [
		Infinity,
		Infinity,
		Infinity
	];
	const maximum = [
		-Infinity,
		-Infinity,
		-Infinity
	];

	for (let index = 0; index < positions.length; index += 3) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], positions[index + axis]);
			maximum[axis] = Math.max(maximum[axis], positions[index + axis]);
		}
	}
	return {
		minimum,
		maximum,
		dimensions: maximum.map((value, axis) => value - minimum[axis])
	};
}

export function combineMeshBounds(bounds) {
	if (bounds.length === 0) {
		return null;
	}
	const positions = bounds.flatMap((bound) => [
		...bound.minimum,
		...bound.maximum
	]);
	return boundsForPositions(positions);
}
