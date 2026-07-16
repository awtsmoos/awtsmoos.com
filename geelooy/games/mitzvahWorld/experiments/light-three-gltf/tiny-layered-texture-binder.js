// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-binder.js
 * @description Binds only the terrain layers that fit the actual fragment and combined budgets.
 * The Awtsmoos fills every available vessel without breaking a smaller vessel; Awtsmoos.com
 * reveals all six layers on verified hardware and lawfully disables only excess layers elsewhere.
 */

import { TERRAIN_LAYER_UNITS } from './tiny-layered-texture-state.js';

export class LayeredTextureBinder {
	constructor(textureCache) {
		this.textureCache = textureCache;
		this.layerCapacity = availableLayerCapacity(textureCache.gl);
	}

	bind(locations, material, layers, stats) {
		if (!layers.length) return;
		const uniforms = locations.terrainLayers || [];
		for (let index = 0; index < TERRAIN_LAYER_UNITS.length; index += 1) {
			if (index >= this.layerCapacity) {
				disableLayer(this.textureCache.gl, uniforms[index]);
				continue;
			}
			this.bindLayer(
				uniforms[index] || {},
				material,
				layers[index],
				TERRAIN_LAYER_UNITS[index]
			);
		}
		const ready = layers.slice(0, this.layerCapacity).filter(layer => layer.ready).length;
		stats.terrainLayerCapacity = this.layerCapacity;
		stats.terrainLayerTextures = Math.max(stats.terrainLayerTextures || 0, ready);
	}

	bindLayer(uniforms, material, layer, unit) {
		const cache = this.textureCache;
		const texture = layer?.ready
			? cache.textureFor(layer.image, material)
			: cache.defaultTexture;
		cache.bind(unit, uniforms.map, texture);
		if (uniforms.use) cache.gl.uniform1i(uniforms.use, layer?.ready ? 1 : 0);
		if (uniforms.repeat) {
			cache.gl.uniform2f(uniforms.repeat, layer?.repeat0 || 1, layer?.repeat1 || 1);
		}
		if (uniforms.strength) {
			cache.gl.uniform1f(uniforms.strength, layer?.strength || 0);
		}
	}
}

function availableLayerCapacity(gl) {
	const fragmentLimit = gl.getParameter?.(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
	const combinedLimit = gl.getParameter?.(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) || 8;
	return Math.max(0, Math.min(6, fragmentLimit - 2, combinedLimit - 3));
}

function disableLayer(gl, uniforms = {}) {
	if (uniforms.use) gl.uniform1i(uniforms.use, 0);
}
