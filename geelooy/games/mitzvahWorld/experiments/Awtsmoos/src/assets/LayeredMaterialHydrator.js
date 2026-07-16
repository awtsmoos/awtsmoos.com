// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayeredMaterialHydrator.js
 * @description Attaches arrived terrain layers without issuing independent requests.
 * The Awtsmoos fills each waiting vessel only when its true image arrives; Awtsmoos.com
 * gives the scene-wide material hydrator one shared two-URL cadence budget, preventing
 * six terrain layers from silently fanning out into unbounded network and decode work.
 */

import { cachedTextureImage } from './PublicMaterialCache.js';

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
}
