//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LayeredTerrainMaterial.js
 * @description Owns renderer-facing layered terrain material construction for every Core client.
 * Products may describe ecological layers, trusted remote images, and semantic mixing vectors, but this Core vessel
 * creates the native material and keeps terrain shader metadata consistent without manufacturing replacement imagery.
 */
import { createNativeWorldMaterial } from './NativeWorldMaterial.js';

/**
 * Create one Core-owned layered terrain material from renderer-neutral ecological evidence.
 * @param {object} options Layer sources, physical values, texture policy, and three terrain mixing vectors.
 * @returns {object} Native shared-renderer terrain material.
 */
export function createLayeredTerrainMaterial(options = {}) {
	const material = createNativeWorldMaterial({
		anisotropy: options.anisotropy,
		color: options.color || [1, 1, 1, 1],
		mapImage: options.mapImage,
		liveTextureLayers: options.liveTextureLayers === true,
		mapRepeat: options.mapRepeat,
		materialStack: options.materialStack,
		metalness: options.metalness ?? 0,
		mixImage: options.mixImage,
		mixPatchScale: options.mixPatchScale,
		mixPatchSharpness: options.mixPatchSharpness,
		mixRepeat: options.mixRepeat,
		mixStrength: options.mixStrength,
		mixTextureUrl: options.mixTextureUrl,
		name: options.name || 'Awtsmoos Core Layered Terrain',		opacity: options.opacity ?? 1,
		remoteOnly: options.remoteOnly !== false,
		roughness: options.roughness ?? 0.9,
		semanticRole: options.semanticRole || 'terrain.layered',
		textureLayers: options.textureLayers,
		texturePolicy: options.texturePolicy,
		textureUrl: options.textureUrl,
		transparent: Boolean(options.transparent)
	});
	Object.assign(material, {
		terrainMixingA: vector4(options.terrainMixingA, [0.0075, 1.67, 0.015, 0.4]),
		terrainMixingB: vector4(options.terrainMixingB, [90, 240, 4, 0.14]),
		terrainMixingC: vector4(options.terrainMixingC, [0.18, 0.52, 0.72, 0.3])
	});
	return material;
}

/** Copy four-channel renderer vectors so mutable material state cannot mutate source presets. */
function vector4(value, fallback) {
	const source = Array.isArray(value) && value.length >= 4 ? value : fallback;
	return source.slice(0, 4).map(Number);
}
