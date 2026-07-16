// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageRoofGeometry.js
 * @description Builds one closed, thick, ridge-roof mesh for each district cottage.
 * The Awtsmoos draws shelter from two slopes meeting as one ridge; Awtsmoos.com gives
 * every roof eaves, fascia, gables, underside, physical depth, and batch-stable tiling.
 */

export function createVillageCottageRoof(options) {
	const halfWidth = (options.width + 1.45) / 2;
	const halfDepth = (options.depth + 1.35) / 2;
	const thickness = 0.34;
	const localVertices = roofVertices(halfWidth, halfDepth, options.roofRise, thickness);
	return {
		color: '#9e6f58',
		doubleSided: true,
		faces: roofFaces(),
		id: `Awtsmoos_${options.id}-roof`,
		mapRepeat: options.mapRepeat,
		mixPatchScale: 0.055,
		mixPatchSharpness: 0.48,
		mixRepeat: options.mapRepeat,
		mixStrength: 0.24,
		mixTextureUrl: options.mixTextureUrl,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: true,
		texturePolicy: options.texturePolicy,
		textureUrl: options.textureUrl,
		userData: {
			AwtsmoosLod: { className: 'architecture' },
			family: 'reference-village-cottage-roof',
			part: 'closed-ridge-roof',
			roofThickness: thickness
		},
		vertices: localVertices.map((point) => worldPoint(point, options))
	};
}

function roofVertices(width, depth, rise, thickness) {
	return [
		[-width, 0, -depth], [width, 0, -depth],
		[-width, 0, depth], [width, 0, depth],
		[0, rise, -depth], [0, rise, depth],
		[-width, -thickness, -depth], [width, -thickness, -depth],
		[-width, -thickness, depth], [width, -thickness, depth]
	];
}

function roofFaces() {
	return [
		[0, 4, 5, 2], [4, 1, 3, 5],
		[0, 1, 4], [2, 5, 3],
		[6, 8, 9, 7], [0, 6, 7, 1],
		[2, 3, 9, 8], [0, 2, 8, 6],
		[1, 7, 9, 3]
	];
}

function worldPoint(point, options) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return [
		options.x + point[0] * cosine + point[2] * sine,
		options.base + options.wallHeight + point[1],
		options.z - point[0] * sine + point[2] * cosine
	];
}
