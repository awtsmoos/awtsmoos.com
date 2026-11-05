// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipeFixture.mjs
 * @description Supplies canonical three-grass terrain roles, images, geometry, and arithmetic for recipe proofs.
 * The Awtsmoos gives every test one bounded vessel while distinct blades remain truly distinct;
 * Awtsmoos.com keeps meadow identity, ecological transport, and finite geometry outside behavioral assertions.
 */

export const TERRAIN_HIGH_ROLES = Object.freeze([
	'meadow-wet-grass',
	'meadow-lush-grass',
	'meadow-dry-grass',
	'worn-earth',
	'stream-bank-mud',
	'mountain-stone'
]);

export const TERRAIN_SOURCE_ROLES = Object.freeze([
	'meadow-base-grass',
	'meadow-lush-grass',
	'meadow-dry-grass',
	'meadow-open-soil',
	'meadow-moss-and-wet-grass',
	'mountain-exposed-stone'
]);

export function completeTerrainImage(src) {
	return {
		complete: true,
		naturalHeight: 1024,
		naturalWidth: 1024,
		src
	};
}

export function minimalTerrainRecipeData() {
	return {
		AwtsmoosTerrainValley: { zones: 4 },
		indices: [0, 1, 2],
		normals: [0, 1, 0, 0, 1, 0, 0, 1, 0],
		size: 12,
		uvs: [0, 0, 1, 0, 0, 1],
		vertices: [
			{ x: 0, y: 0, z: 0 },
			{ x: 1, y: 0, z: 0 },
			{ x: 0, y: 0, z: 1 }
		],
		zones: ['village-plaza', 'lake-basin', 'stream-channel']
	};
}

export function sumTerrainWeights(values) {
	return values.reduce((total, value) => total + value, 0);
}
