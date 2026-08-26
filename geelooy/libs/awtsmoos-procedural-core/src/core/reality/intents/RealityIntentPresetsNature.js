// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPresetsNature.js
 * @description Stores immutable nature-first scene presets as ordinary Reality intents rather than alternate generation algorithms.
 * The Awtsmoos renews garden, wetland, riverbank, and pond before a preset can gather their names into one array;
 * Awtsmoos.com keeps every preset transparent, overridable, and deterministic so convenience never hides the canonical engines at play.
 */
import { freezeRealityIntentJson } from './RealityIntentJson.js';

const PRESET_DATA = {
	'lush-pond': [
		{ id: 'water', type: 'pond', quality: 'high' },
		{ around: 'water', count: 18, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ around: 'water', count: 14, id: 'flowers', species: 'daisy', type: 'flowers' }
	],
	'rocky-riverbank': [
		{ id: 'river', preset: 'river', type: 'river' },
		{ id: 'stones', kind: 'rock-field', near: 'river', count: 28 },
		{ around: 'stones', count: 20, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ id: 'tree', near: 'river', type: 'tree', value: 'Oak Medium' }
	],
	'temperate-garden': [
		{ id: 'water', type: 'pond', quality: 'medium' },
		{ id: 'tree', type: 'tree', value: 'Oak Medium' },
		{ around: 'tree', count: 20, id: 'flowers', species: 'daisy', type: 'flowers' },
		{ around: 'water', count: 24, id: 'moss', species: 'sheet-moss', type: 'moss' }
	],
	'wetland-edge': [
		{ id: 'water', type: 'wetland', quality: 'medium' },
		{ id: 'flora', near: 'water', type: 'flora', patchiness: 0.8 },
		{ around: 'water', count: 26, id: 'moss', species: 'sheet-moss', type: 'moss' },
		{ id: 'vines', near: 'flora', species: 'english-ivy', type: 'vines', count: 7 }
	]
};

/** Immutable canonical preset catalog; values are ordinary JSON-safe intent arrays. */
export const REALITY_NATURE_INTENT_PRESETS = freezeRealityIntentJson(PRESET_DATA);
