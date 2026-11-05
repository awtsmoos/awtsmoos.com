// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageBlossomBatch.js
 * @description Folds every cottage flower-box blossom into one petal geometry vessel.
 * The Awtsmoos opens many petals without multiplying renderer burdens; Awtsmoos.com
 * preserves abundance as one shared draw whose flowers still catch the golden wind.
 */

export function createCottageBlossomBatch(blossoms) {
	if (!blossoms.length) return null;
	const vertices = [];
	const faces = [];
	for (const blossom of blossoms) {
		appendBlossom(vertices, faces, blossom);
	}
	return {
		alphaMode: 'OPAQUE',
		color: '#e16c96',
		doubleSided: true,
		faces,
		id: 'Awtsmoos_cottage-blossom-batch',
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: 'flower-box-petal-geometry', shader: 'petal-geometry-wind' },
		userData: {
			AwtsmoosLod: { className: 'vegetation' },
			family: 'reference-cottage-ornament-batch',
			part: 'blossoms'
		},
		vertices
	};
}

function appendBlossom(vertices, faces, blossom) {
	const start = vertices.length;
	const { x, y, z } = blossom.position;
	const radius = blossom.size.x * 0.55;
	vertices.push(
		[x, y + blossom.size.y * 0.65, z],
		[x, y - blossom.size.y * 0.35, z],
		[x + radius, y, z],
		[x, y, z + radius],
		[x - radius, y, z],
		[x, y, z - radius]
	);
	for (const [a, b] of [[2, 3], [3, 4], [4, 5], [5, 2]]) {
		faces.push([start, start + a, start + b]);
		faces.push([start + 1, start + b, start + a]);
	}
}
