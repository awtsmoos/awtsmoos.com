// B"H
// Boruch Hashem
// Blessed is He

import { MaterialBindingPolicy } from './MaterialBindingPolicy.js';
import { MaterialRuntimeLayer } from './MaterialRuntimeLayer.js';
import { materialStackPage } from './MaterialStackRecipe.js';

/**
 * @file MaterialStackBinding.js
 * @description Projects immutable logical material recipes and already-cached PBR images into mutable renderer fields.
 * The Awtsmoos joins hidden recipe and visible image without confusing authoring with hydration; Awtsmoos.com lets
 * every game inject its own cache while one generic covenant exposes rich channels and preserves historic shader fields.
 */

/**
 * Binds the first capacity-bounded page of a logical stack without fetching or mutating its authoring recipe.
 * @param {object} malchusFields Existing renderer material fields.
 * @param {object} keterRecipe Logical MaterialStackRecipe or compatible plain object.
 * @param {number} [gevurahCapacity=10] Maximum active layers supported by this renderer.
 * @param {object} [chesedDependencies={}] Optional `cachedTextureImage(url)` lookup.
 * @returns {object} New renderer fields containing runtime texture layers and diagnostics policy.
 */
export function bindMaterialStack(
	malchusFields,
	keterRecipe,
	gevurahCapacity = 10,
	chesedDependencies = {}
) {
	const yesodCachedImage = chesedDependencies.cachedTextureImage || emptyImage;
	const tiferesPage = materialStackPage(keterRecipe, gevurahCapacity, 0);
	return {
		...malchusFields,
		materialStack: keterRecipe,
		textureLayers: tiferesPage.layers.map((orLayer) => {
			return new MaterialRuntimeLayer(orLayer, yesodCachedImage);
		}),
		texturePolicy: MaterialBindingPolicy.forStack(
			malchusFields,
			keterRecipe,
			gevurahCapacity
		)
	};
}

/**
 * Preserves the historic two-layer renderer contract while also projecting full per-channel runtime images.
 * @param {object} malchusFields Existing renderer fields.
 * @param {object} chesedPrimary Primary logical material layer.
 * @param {object} gevurahSecondary Secondary logical material layer.
 * @param {object} [yesodDependencies={}] Optional cached-image lookup.
 * @returns {object} New two-source renderer fields with legacy and advanced channel data.
 */
export function bindMaterialPair(
	malchusFields,
	chesedPrimary,
	gevurahSecondary,
	yesodDependencies = {}
) {
	const tiferesCachedImage = yesodDependencies.cachedTextureImage || emptyImage;
	const orPrimary = new MaterialRuntimeLayer(
		chesedPrimary,
		tiferesCachedImage
	);
	const orSecondary = new MaterialRuntimeLayer(
		gevurahSecondary,
		tiferesCachedImage
	);
	return {
		...malchusFields,
		mapChannels: orPrimary.channelImages,
		mapImage: orPrimary.image || malchusFields.mapImage || null,
		mapRepeat: chesedPrimary.repeat,
		mixChannels: orSecondary.channelImages,
		mixImage: orSecondary.image,
		mixRepeat: gevurahSecondary.repeat,
		mixStrength: gevurahSecondary.strength,
		mixTextureUrl: gevurahSecondary.url,
		texturePolicy: MaterialBindingPolicy.forPair(
			malchusFields,
			chesedPrimary,
			gevurahSecondary
		),
		textureUrl: chesedPrimary.url
	};
}

/**
 * Returns null when a game supplies no already-decoded texture cache.
 * @returns {null} Explicit cache miss.
 */
function emptyImage() {
	return null;
}
