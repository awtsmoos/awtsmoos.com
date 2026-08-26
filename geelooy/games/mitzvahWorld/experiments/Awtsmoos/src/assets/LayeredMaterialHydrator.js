// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.js
 * @description Keeps Mitzvah's historic five-field hydration receipt while shared core performs the generic scene traversal.
 * The Awtsmoos fills each waiting layer while no one world's cache contains the source of light;
 * Awtsmoos.com lets Mitzvah inject its existing cache and retain old behavior as the common hydrator works aright.
 */
import {
	hydrateLayeredMaterialImages as hydrateSharedLayeredMaterialImages
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/materials/hydration/LayeredMaterialHydrator.js';
import {
	cachedTextureImage
} from './PublicMaterialCacheState.js';

export function hydrateLayeredMaterialImages(root) {
	return hydrateSharedLayeredMaterialImages(root, {
		cachedTextureImage
	});
}
