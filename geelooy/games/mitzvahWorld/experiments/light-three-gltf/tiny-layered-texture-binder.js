// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-binder.js
 * @description Binds every compiled material-stack layer and its ecological controls.
 * The Awtsmoos fills each available vessel without breaking a smaller one; Awtsmoos.com
 * reveals ten layers on capable hardware and disables only lawfully omitted shader slots.
 */

import {
	terrainLayerCapacity,
	terrainLayerUnits
} from './tiny-terrain-layer-policy.js';

export class LayeredTextureBinder {
	constructor(textureCache) {
		this.textureCache = textureCache;
		this.layerCapacity = terrainLayerCapacity(textureCache.gl);
		this.layerUnits = terrainLayerUnits(this.layerCapacity);
	}

	bind(locations, material, layers, stats) {
		if (!layers.length) return;
		const uniforms = locations.terrainLayers || [];
		for (let index = 0; index < uniforms.length; index += 1) {
			this.bindLayer(
				uniforms[index],
				material,
				layers[index],
				this.layerUnits[index]
			);
		}
		const ready = layers.slice(0, uniforms.length).filter(layer => layer.ready).length;
		stats.terrainLayerCapacity = uniforms.length;
		stats.terrainLayerLogicalCount = material.textureLayers?.length || 0;
		stats.terrainLayerTextures = Math.max(stats.terrainLayerTextures || 0, ready);
	}

	bindLayer(uniforms = {}, material, layer, unit) {
		const cache = this.textureCache;
		const ready = Boolean(layer?.ready && Number.isFinite(unit));
		const texture = ready
			? cache.textureFor(layer.image, material)
			: cache.defaultTexture;
		if (Number.isFinite(unit)) cache.bind(unit, uniforms.map, texture);
		if (uniforms.use) cache.gl.uniform1i(uniforms.use, ready ? 1 : 0);
		if (uniforms.repeat) cache.gl.uniform2f(uniforms.repeat, layer?.repeat0 || 1, layer?.repeat1 || 1);
		if (uniforms.strength) cache.gl.uniform1f(uniforms.strength, layer?.strength || 0);
		if (uniforms.angle) cache.gl.uniform1f(uniforms.angle, layer?.angle || 0);
		if (uniforms.zones) cache.gl.uniform4fv(uniforms.zones, layer?.zones || [1, 1, 1, 1]);
		if (uniforms.slope) cache.gl.uniform2fv(uniforms.slope, layer?.slope || [0, 1]);
		if (uniforms.height) cache.gl.uniform2fv(uniforms.height, layer?.height || [-10000, 10000]);
		if (uniforms.wetness) cache.gl.uniform1f(uniforms.wetness, layer?.wetness || 0);
	}
}
