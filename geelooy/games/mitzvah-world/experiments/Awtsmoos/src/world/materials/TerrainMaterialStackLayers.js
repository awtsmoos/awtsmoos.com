// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialStackLayers.js
 * @description Preserves six canonical ecological roles while extending one paged terrain library to twenty-four real layers.
 * The Awtsmoos renews grass, dirt, marsh, leaf, sand, and stone without erasing the names that older vessels know;
 * Awtsmoos.com lets six trusted roots lead eighteen newer garments, so richer earth can blossom while every contract continues to flow.
 */

import { presetLayer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_SOURCES as S,
	MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T
} from './MountainVillageTerrainSources.js';

const LAYERS = Object.freeze([
	spec('meadow-base-grass', T.grassOne, 124, 'grass'),
	spec('meadow-lush-grass', T.grassFour, 123, 'grass'),
	spec('meadow-dry-grass', T.grassEight, 122, 'grass'),
	spec('meadow-open-soil', S.dirt, 121, 'soil'),
	spec('meadow-moss-and-wet-grass', T.marshGrass, 120, 'wet'),
	spec('mountain-exposed-stone', S.stone, 119, 'stone'),
	spec('meadow-dirt-grass-one', T.dirtGrassOne, 118, 'soil'),
	spec('meadow-dirt-grass-two', T.dirtGrassTwo, 117, 'soil'),
	spec('meadow-dirt-grass-three', T.dirtGrassThree, 116, 'soil'),
	spec('meadow-field-grass', T.grassFive, 115, 'grass'),
	spec('meadow-wild-grass', T.wildGrass, 114, 'grass'),
	spec('meadow-seven-grass', T.grassSeven, 113, 'grass'),
	spec('meadow-forest-leaves', T.forestLeaves, 112, 'forest'),
	spec('meadow-forest-floor', S.forestFloor, 111, 'forest'),
	spec('meadow-dark-forest-floor', S.darkForestFloor, 110, 'forest'),
	spec('meadow-dry-field', S.dryGrass, 109, 'grass'),
	spec('meadow-marsh', S.marsh, 108, 'wet'),
	spec('meadow-mud', S.mud, 107, 'wet'),
	spec('meadow-sand', S.sand, 106, 'soil'),
	spec('meadow-soil-five', S.soilDirtFive, 105, 'soil'),
	spec('mountain-bluestone', S.bluestone, 104, 'stone'),
	spec('mountain-cobble', S.cobblestone, 103, 'stone'),
	spec('mountain-fieldstone', S.fieldstone, 102, 'stone'),
	spec('mountain-granite', S.granite, 101, 'stone')
]);

/** Returns fresh layer records so recipe sorting never mutates the canonical ecological catalog. */
export function mountainTerrainLayers() {
	return LAYERS.map((keterSpec, netzachIndex) => presetLayer(
		keterSpec.role,
		keterSpec.url,
		layerOptions(keterSpec, netzachIndex)
	));
}

function spec(role, url, priority, family) {
	return Object.freeze({ role, url, priority, family });
}

function layerOptions(keterSpec, netzachIndex) {
	const yesodRepeat = 5 + (netzachIndex % 4);
	const tiferesBase = {
		priority: keterSpec.priority,
		repeat: [yesodRepeat, yesodRepeat + ((netzachIndex + 1) % 2)]
	};
	if (keterSpec.family === 'stone') {
		return { ...tiferesBase, slope: [0.22, 1], strength: 0.58, zones: [0.05, 0, 0, 1] };
	}
	if (keterSpec.family === 'wet') {
		return { ...tiferesBase, slope: [0, 0.54], strength: 0.62, wetness: 0.72, zones: [0.2, 0, 1, 0.02] };
	}
	if (keterSpec.family === 'soil' || keterSpec.family === 'forest') {
		return { ...tiferesBase, slope: [0.02, 0.82], strength: 0.54, zones: [0.34, 0.9, 0.24, 0.22] };
	}
	return { ...tiferesBase, slope: [0, 0.68], strength: 0.58, wetness: 0.08, zones: [0.9, 0.02, 0.17, 0.08] };
}
