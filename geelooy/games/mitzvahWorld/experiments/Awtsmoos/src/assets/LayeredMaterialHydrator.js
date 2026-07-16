// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.js
 * @description Progressively requests and attaches every ordered full-resolution terrain image.
 * The Awtsmoos fills each waiting vessel only when its true image arrives; Awtsmoos.com keeps
 * first motion immediate while meadow, mud, forest, stone, marsh, and shore awaken in place.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from './PublicMaterialCache.js';

export function hydrateLayeredMaterialImages(root) {
	const stats = {
		bound: 0,
		layers: 0,
		materials: 0,
		pending: 0,
		requested: 0
	};
	root?.traverse?.(object => hydrateObject(object, stats));
	return stats;
}

function hydrateObject(object, stats) {
	const layers = object.material?.textureLayers;
	if (!Array.isArray(layers)) return;
	stats.materials += 1;
	for (const layer of layers) hydrateLayer(layer, stats);
}

function hydrateLayer(layer, stats) {
	stats.layers += 1;
	if (!layer.image && layer.url) {
		layer.image = cachedTextureImage(layer.url);
	}
	if (layer.image) {
		stats.bound += 1;
		return;
	}
	stats.pending += 1;
	if (!layer.url) return;
	stats.requested += 1;
	loadPublicMaterialUrl(layer.url).catch(() => null);
}
