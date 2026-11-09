//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CinematicTerrainMaterial.js
 * @description Binds Core's six remote ecological texture layers through the shared layered-terrain material authority.
 * The cinematic preset chooses remote semantic garments and readiness, while native material construction and terrain-vector
 * ownership remain centralized so Studio, MitzvahWorld, and future products cannot grow contradictory terrain renderers.
 * A caller may forward its measured ground sampling — anisotropy, map repeat, and texture policy — and this module
 * passes it through to the layered material instead of silently dropping it; without those options the historic
 * Core defaults (anisotropy 3, repeat [1, 1]) still apply, so existing callers are unchanged.
 */
import { createCinematicTerrainTextureLayers } from './CinematicTerrainTextureLayers.js';
import { createLayeredTerrainMaterial } from './LayeredTerrainMaterial.js';

/**
 * Create the cinematic six-layer terrain material and its asynchronous remote-image readiness promise.
 * @param {object} options Texture discovery, seed, hydration dependencies, and measured ground sampling.
 * @param {number} [options.anisotropy] Near-field anisotropy the caller measured (8 desktop / 4 mobile in Mitzvah World).
 * @param {Array<number>} [options.mapRepeat] Caller-derived UV repeat from real source pixels at the tier texel density.
 * @param {object} [options.texturePolicy] Caller sampling policy (color space, mipmaps, filters, wrap); Core covenant fields always win.
 * @returns {{material: object, ready: Promise}} Shared native material plus bounded hydration readiness.
 */
export function createCinematicTerrainMaterial(options = {}) {
	const samplingRepeat = validRepeatPair(options.mapRepeat);
	const textureState = createCinematicTerrainTextureLayers({ ...options, mapRepeat: samplingRepeat });
	const material = createLayeredTerrainMaterial({
		anisotropy: options.anisotropy,
		liveTextureLayers: true,
		mapRepeat: samplingRepeat,
		name: 'Awtsmoos Core Cinematic Terrain',
		textureLayers: textureState.layers,
		texturePolicy: {
			...(options.texturePolicy || {}),
			generatedTextureAllowed: false,
			layerCount: 6,
			remoteOnly: true,
			semanticRole: 'terrain.cinematic.ecological',
			shader: 'terrain-layered-six-source-ecological'
		},
		terrainMixingA: [0.0075, 1.67, 0.015, 0.4],
		terrainMixingB: [90, 240, 4, 0.14],
		terrainMixingC: [0.18, 0.52, 0.72, 0.3]
	});
	return {
		material,
		ready: textureState.ready
	};
}

/** Accept only a finite positive UV-repeat pair; anything else falls back to the historic Core defaults. */
function validRepeatPair(value) {
	if (!Array.isArray(value) || value.length < 2) return undefined;
	const pair = [Number(value[0]), Number(value[1])];
	return pair.every(item => Number.isFinite(item) && item > 0) ? pair : undefined;
}
