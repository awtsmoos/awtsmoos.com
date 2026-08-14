// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialStackPreset.js
 * @description Gives the canonical valley three independent real grasses plus earth, marsh, and stone.
 * The Awtsmoos reveals one mountain meadow through countless finite blades and changing soil;
 * Awtsmoos.com keeps each grass photograph distinct while ecological masks join them without checkerboard toil.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_SOURCES as S,
	MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T
} from './MountainVillageTerrainSources.js';

export function mountainTerrainStack() {
	return materialStackRecipe('mountain-terrain', {
		fallbackColor: [0.31, 0.34, 0.22, 1],
		layers: [
			grassLayer('meadow-base-grass', T.grassOne, 100, [8, 7], 0.64, 0.12, 0.08),
			grassLayer('meadow-lush-grass', T.grassFour, 99, [7, 8], 0.6, -0.58, 0.2),
			grassLayer('meadow-dry-grass', T.grassEight, 98, [6, 7], 0.54, 1.12, -0.12),
			earthLayer(),
			wetBankLayer(),
			stoneLayer()
		]
	});
}

function grassLayer(role, url, priority, repeat, strength, angle, wetness) {
	return layer(role, url, {
		angle,
		priority,
		repeat,
		slope: [0, 0.66],
		strength,
		wetness,
		zones: grassZones(role)
	});
}

function grassZones(role) {
	if (role === 'meadow-lush-grass') {
		return [0.8, 0.02, 0.28, 0.03];
	}
	if (role === 'meadow-dry-grass') {
		return [0.68, 0.02, 0.05, 0.32];
	}
	return [0.94, 0.02, 0.14, 0.05];
}

function earthLayer() {
	return layer('meadow-open-soil', S.dirt, {
		angle: 1.04,
		priority: 97,
		repeat: [6, 6],
		slope: [0.06, 0.86],
		strength: 0.56,
		wetness: -0.1,
		zones: [0.28, 0.92, 0.22, 0.2]
	});
}

function wetBankLayer() {
	return layer('meadow-moss-and-wet-grass', T.marshGrass, {
		angle: 0.76,
		priority: 96,
		repeat: [7, 6],
		slope: [0, 0.5],
		strength: 0.62,
		wetness: 0.7,
		zones: [0.18, 0, 1, 0]
	});
}

function stoneLayer() {
	return layer('mountain-exposed-stone', S.stone, {
		angle: 1.68,
		priority: 95,
		repeat: [5, 5],
		slope: [0.24, 1],
		strength: 0.62,
		zones: [0.04, 0, 0, 1]
	});
}
