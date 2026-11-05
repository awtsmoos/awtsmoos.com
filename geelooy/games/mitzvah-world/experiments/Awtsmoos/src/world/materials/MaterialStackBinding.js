// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackBinding.js
 * @description Preserves Mitzvah's material-binding API while injecting its decoded-image cache into shared generic binding.
 * The Awtsmoos joins cached image and authored layer while no one game's cache contains His light;
 * Awtsmoos.com lets houses, roads, and mountains keep the same calls as the shared core performs the binding right.
 */
import {
	bindMaterialPair as bindSharedMaterialPair,
	bindMaterialStack as bindSharedMaterialStack
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/materials/stack/MaterialStackBinding.js';
import {
	cachedTextureImage
} from '../../assets/PublicMaterialCache.js';

export function bindMaterialStack(fields, recipe, activeCapacity = 10) {
	return bindSharedMaterialStack(fields, recipe, activeCapacity, {
		cachedTextureImage
	});
}

export function bindMaterialPair(fields, primaryLayer, secondaryLayer) {
	return bindSharedMaterialPair(fields, primaryLayer, secondaryLayer, {
		cachedTextureImage
	});
}
