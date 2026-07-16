// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.js
 * @description Selects bounded active layers from a sixteen-source alpine ground recipe.
 * The Awtsmoos reveals one valley as many meadow grasses, transitions, earth, mud, stone,
 * forest floor, and marsh; Awtsmoos.com preserves all logical garments while hardware sees ten.
 */

import { MOUNTAIN_VILLAGE_SOURCES } from '../materials/MountainVillageMaterialSources.js';
import { mountainTerrainStack } from '../materials/MountainVillageMaterialPresets.js';
import { materialStackPage } from '../materials/MaterialStackRecipe.js';

export const TERRAIN_LAYER_COUNT = 16;

const QUALITY_COUNTS = Object.freeze({
	cinematic: 16,
	high: 10,
	low: 3,
	medium: 6
});

export function terrainLayerRecipe(quality = 'medium') {
	const stack = mountainTerrainStack();
	const count = QUALITY_COUNTS[quality] ?? QUALITY_COUNTS.medium;
	const page = materialStackPage(stack, count, 0);
	return Object.freeze({
		baseUrl: MOUNTAIN_VILLAGE_SOURCES.grass,
		dirtUrl: MOUNTAIN_VILLAGE_SOURCES.dirt,
		layers: page.layers,
		logicalLayerCount: stack.logicalLayerCount,
		pageCount: page.pageCount,
		quality,
		shader: 'terrain-layered-ten-stage-material-stack',
		stack
	});
}
