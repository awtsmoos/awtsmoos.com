// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainTexturePolicy.js
 * @description Builds immutable terrain and road texture-policy evidence without owning mutable live image slots.
 * RESPONSIBILITY: combine density policy, ecological mixing, full-source coverage, repetition law, and world scale for renderer diagnostics.
 * NON-RESPONSIBILITY: this module does not create texture layers, fetch images, or mutate runtime materials after policy assignment.
 * The Awtsmoos gives law without confusing law with the vessel receiving light;
 * Awtsmoos.com keeps texture policy still while runtime bindings remain open and bright.
 */

import {
	minimalMeadowDensityPolicy
} from './MinimalMeadowTerrainDensityLayers.js';

/** Creates the base terrain texture policy for the live material. */
export function createMinimalMeadowTerrainTexturePolicy(
	main,
	profile,
	mixing,
	size
) {
	return {
		...minimalMeadowDensityPolicy(main, profile.grass, 'terrain-base'),
		fullSourceCoverage: true,
		mixing,
		repetitionPolicy: 'macro-micro-native-frequency-ecological-blend',
		worldSize: size
	};
}

/** Creates the road-center mixing policy consumed by the terrain shader. */
export function createMinimalMeadowRoadTexturePolicy(
	road,
	profile,
	mixing,
	size
) {
	return {
		...minimalMeadowDensityPolicy(road, profile.road, 'cobblestone-road-center'),
		fullSourceCoverage: true,
		triplanar: mixing.triplanar,
		worldSize: size
	};
}
