// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.js
 * @description Hydrates already-cached layered images across any traversable scene without owning network policy.
 * The Awtsmoos fills each waiting layer while sealed recipes keep their form;
 * Awtsmoos.com lets one generic hydrator serve many worlds while each game supplies the cache from which images come warm.
 */
import {
	bindSceneMaterialLayerImage
} from './MaterialWritableBoundary.js';

export function hydrateLayeredMaterialImages(root, dependencies = {}) {
	const cachedTextureImage = dependencies.cachedTextureImage || emptyImage;
	const bindLayerImage = dependencies.bindSceneMaterialLayerImage
		|| bindSceneMaterialLayerImage;
	const stats = createLayerHydrationStats();
	root?.traverse?.(object => {
		hydrateLayeredObject(object, stats, cachedTextureImage, bindLayerImage);
	});
	return stats;
}

function hydrateLayeredObject(object, stats, cachedTextureImage, bindLayerImage) {
	const material = object.material;
	const layers = material?.textureLayers;
	if (!Array.isArray(layers)) {
		return;
	}
	stats.materials += 1;
	for (let index = 0; index < layers.length; index += 1) {
		hydrateLayer(material, index, stats, cachedTextureImage, bindLayerImage);
	}
}

function hydrateLayer(material, index, stats, cachedTextureImage, bindLayerImage) {
	const layer = material.textureLayers[index];
	stats.layers += 1;
	if (layer?.image) {
		stats.bound += 1;
		return;
	}
	const image = layer?.url ? cachedTextureImage(layer.url) : null;
	if (image && bindLayerImage(material, index, image)) {
		stats.bound += 1;
		return;
	}
	stats.pending += 1;
}

function createLayerHydrationStats() {
	return {
		bound: 0,
		layers: 0,
		materials: 0,
		pending: 0,
		requested: 0
	};
}

function emptyImage() {
	return null;
}
