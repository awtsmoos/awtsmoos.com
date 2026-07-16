// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.js
 * @description Orders six full-resolution ecological layers for sequential shader revelation.
 * The Awtsmoos is one ground appearing as meadow, worn earth, wet bank, shaded forest,
 * mountain stone, marsh, and shore; Awtsmoos.com gives every garment a measured strength.
 */

import { highestResolutionSurface } from '../../assets/HighestResolutionSurfaceCatalog.js';

export const TERRAIN_LAYER_COUNT = 6;

const LAYERS = Object.freeze([
	layer('dryGrass', [24, 24], 0.46),
	layer('mud', [18, 18], 0.82),
	layer('forestFloor', [16, 16], 0.78),
	layer('stone', [14, 14], 0.9),
	layer('marsh', [22, 22], 0.72),
	layer('sand', [19, 19], 0.86)
]);

const QUALITY_COUNTS = Object.freeze({
	low: 1,
	medium: 2,
	high: 4,
	cinematic: 6
});

export function terrainLayerRecipe(quality = 'medium') {
	const count = QUALITY_COUNTS[quality] ?? QUALITY_COUNTS.medium;
	return Object.freeze({
		baseUrl: highestResolutionSurface('baseGrass'),
		dirtUrl: highestResolutionSurface('dirt'),
		layers: Object.freeze(LAYERS.slice(0, count)),
		quality,
		shader: 'terrain-layered-six-stage-mix'
	});
}

function layer(role, repeat, strength) {
	return Object.freeze({
		repeat: Object.freeze(repeat),
		role,
		strength,
		url: highestResolutionSurface(role)
	});
}
