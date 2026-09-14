//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CinematicTerrainMaterial.js
 * @description Binds Core's six remote ecological texture layers through the shared layered-terrain material authority.
 * The cinematic preset chooses remote semantic garments and readiness, while native material construction and terrain-vector
 * ownership remain centralized so Studio, MitzvahWorld, and future products cannot grow contradictory terrain renderers.
 */
import { createCinematicTerrainTextureLayers } from './CinematicTerrainTextureLayers.js';
import { createLayeredTerrainMaterial } from './LayeredTerrainMaterial.js';

/**
 * Create the cinematic six-layer terrain material and its asynchronous remote-image readiness promise.
 * @param {object} options Texture discovery, seed, and hydration dependencies.
 * @returns {{material: object, ready: Promise}} Shared native material plus bounded hydration readiness.
 */
export function createCinematicTerrainMaterial(options = {}) {
	const textureState = createCinematicTerrainTextureLayers(options);
	const material = createLayeredTerrainMaterial({
		liveTextureLayers: true,
		name: 'Awtsmoos Core Cinematic Terrain',
		textureLayers: textureState.layers,
		texturePolicy: {
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
