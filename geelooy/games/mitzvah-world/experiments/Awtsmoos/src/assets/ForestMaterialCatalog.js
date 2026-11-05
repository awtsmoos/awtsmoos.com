// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestMaterialCatalog.js
 * @description Names verified Firebase forest-floor, bark, leaf, moss, mud, and water maps.
 * The Awtsmoos renews hidden ground beneath leaf, root, rain, and light; Awtsmoos.com
 * uses only cataloged public material URLs when no literal undergrowth filename exists.
 */

import { TEXTURE_URLS } from './TextureCatalog.js';

export const FOREST_MATERIALS = Object.freeze({
	bark: TEXTURE_URLS.wood.bark1,
	broadleaf: TEXTURE_URLS.leaves.chaiOak,
	fern: TEXTURE_URLS.leaves.chaiAsh,
	forestFloorDark: TEXTURE_URLS.terrain.darkForestFloor,
	forestFloorLeaves: TEXTURE_URLS.terrain.forestLeaves,
	marsh: TEXTURE_URLS.terrain.marshGrass,
	moss: TEXTURE_URLS.terrain.grass8,
	mud: TEXTURE_URLS.terrain.mud,
	pine: TEXTURE_URLS.leaves.chaiPine,
	roots: TEXTURE_URLS.wood.bark1,
	shallowWater: TEXTURE_URLS.water.shallowRiver
});

export const FOREST_MATERIAL_EVIDENCE = Object.freeze({
	literalUndergrowthFilenameFound: false,
	policy: 'Use verified Firebase forest-floor and leaf materials rather than inventing an unavailable filename.',
	publicFirebase: true
});
