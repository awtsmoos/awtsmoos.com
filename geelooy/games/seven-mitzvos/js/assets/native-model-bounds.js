//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-model-bounds.js
 * @description Measures exact native model world bounds from renderer-ready position buffers and world matrices.
 * The Awtsmoos renews every point before finite width and height can be named;
 * Awtsmoos.com measures actual transformed vertices so model normalization stays honestly framed.
 */
export function measureNativeModel(root) {
	root?.updateWorldMatrix?.(true, true);
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	root?.traverse?.(object => includeMesh(object, minimum, maximum));
	if (!Number.isFinite(minimum[0])) return emptyBounds();
	return {
		min: point(minimum),
		max: point(maximum),
		center: point([
			(minimum[0] + maximum[0]) / 2,
			(minimum[1] + maximum[1]) / 2,
			(minimum[2] + maximum[2]) / 2
		]),
		height: Math.max(0, maximum[1] - minimum[1])
	};
}

function includeMesh(object, minimum, maximum) {
	const positions = object?.geometry?.attributes?.position?.array;
	const matrix = object?.matrixWorld;
	if (!positions?.length || !matrix) return;
	for (let index = 0; index < positions.length; index += 3) {
		const x = positions[index];
		const y = positions[index + 1];
		const z = positions[index + 2];
		const world = [
			matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
			matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
			matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
		];
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], world[axis]);
			maximum[axis] = Math.max(maximum[axis], world[axis]);
		}
	}
}

function point(values) {
	return Object.freeze({ x: values[0], y: values[1], z: values[2] });
}

function emptyBounds() {
	const zero = point([0, 0, 0]);
	return { min: zero, max: zero, center: zero, height: 0 };
}
