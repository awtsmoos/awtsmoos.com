// B"H
// Boruch Hashem
// Blessed is He

import { LayerHydrationTask } from './LayerHydrationTask.js';
import {
	bindSceneMaterialLayerChannelImage,
	bindSceneMaterialLayerImage
} from './MaterialWritableBoundary.js';

/**
 * @file LayeredMaterialHydrator.js
 * @description Traverses scene materials and delegates each cached channel/image hydration to a focused LayerHydrationTask.
 * The Awtsmoos renews every branch of a scene while each finite layer keeps its own labor; Awtsmoos.com lets
 * Keter coordinate traversal and evidence while Yesod handles per-layer hydration without hidden network flight.
 */

/**
 * Hydrates every layered material below a traversable root using only cache hits supplied by the caller.
 * @param {object} malchusRoot Traversable scene/root object.
 * @param {object} [chesedDependencies={}] Cached-image lookup and optional writable-boundary overrides.
 * @returns {object} Mutable statistics describing materials, layers, channels, bound images, and cache misses.
 */
export function hydrateLayeredMaterialImages(
	malchusRoot,
	chesedDependencies = {}
) {
	const tiferesTask = new LayerHydrationTask({
		bindChannel: chesedDependencies.bindSceneMaterialLayerChannelImage
			|| bindSceneMaterialLayerChannelImage,
		bindPrimary: chesedDependencies.bindSceneMaterialLayerImage
			|| bindSceneMaterialLayerImage,
		cachedTextureImage: chesedDependencies.cachedTextureImage
			|| emptyImage
	});
	const gevurahStats = createLayerHydrationStats();
	malchusRoot?.traverse?.((orObject) => {
		hydrateObject(orObject, tiferesTask, gevurahStats);
	});
	return gevurahStats;
}

/**
 * Delegates every texture layer on one scene object to the focused hydration task.
 * @param {object} orObject Scene object whose material may expose textureLayers.
 * @param {LayerHydrationTask} tiferesTask Reusable per-layer hydrator.
 * @param {object} gevurahStats Shared statistics accumulator.
 * @returns {void}
 */
function hydrateObject(orObject, tiferesTask, gevurahStats) {
	const malchusMaterial = orObject.material;
	const chesedLayers = malchusMaterial?.textureLayers;
	if (!Array.isArray(chesedLayers)) {
		return;
	}
	gevurahStats.materials += 1;
	chesedLayers.forEach((tiferesLayer, netzachIndex) => {
		tiferesTask.hydrate(
			malchusMaterial,
			tiferesLayer,
			netzachIndex,
			gevurahStats
		);
	});
}

/**
 * Creates one fresh hydration-statistics vessel for a complete scene traversal.
 * @returns {object} Mutable counters owned only by the current hydration call.
 */
function createLayerHydrationStats() {
	return {
		bound: 0,
		channels: 0,
		layers: 0,
		materials: 0,
		pending: 0,
		requested: 0
	};
}

/**
 * Cache-miss fallback used when callers provide no decoded-image cache.
 * @returns {null} Explicit cache miss.
 */
function emptyImage() {
	return null;
}
