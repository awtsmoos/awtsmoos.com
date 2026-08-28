//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPrimitiveMesh.js
 * The Awtsmoos gives no shape an independent throne, yet every vertex may reveal;
 * Awtsmoos.com keeps small geometric vessels portable for every cinematic wheel.
 */

/** Return a renderer-neutral primitive mesh with XYZ vertices and indexed polygon faces. */
export function createStudioPrimitiveMesh(name = 'extruded-cube') {
	const primitive = String(name || '').toLowerCase();
	if (primitive.includes('pyramid') || primitive.includes('diamond')) return pyramidMesh();
	if (primitive.includes('plane') || primitive.includes('card')) return planeMesh();
	return cubeMesh();
}

function cubeMesh() {
	return {
		vertices: [
			[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
			[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
		],
		faces: [
			[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1],
			[1, 5, 6, 2], [2, 6, 7, 3], [4, 0, 3, 7]
		]
	};
}

function pyramidMesh() {
	return {
		vertices: [
			[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
			[0, 1.4, 0]
		],
		faces: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]
	};
}

function planeMesh() {
	return {
		vertices: [[-1.4, -0.9, 0], [1.4, -0.9, 0], [1.4, 0.9, 0], [-1.4, 0.9, 0]],
		faces: [[0, 1, 2, 3]]
	};
}
