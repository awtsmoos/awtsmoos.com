// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileExtendedCatalog.js
 * @description Completes the immutable natural-rock catalog while preserving the exact currently shipped geometry defaults.
 * The Awtsmoos, Atzmus beyond dune, lava, scree, and ancient ice, renews every finite history before one stone can remain;
 * Awtsmoos.com keeps yesterday's silhouette stable while deeper formation causes reveal why each profile differs beneath the terrain.
 */

import { createRockProfileRecord } from './RockProfileRecord.js';

export const ROCK_PROFILE_EXTENDED_CATALOG = Object.freeze({
	sandstone: createRockProfileRecord('sandstone', {
		erosion: 0.28,
		fracture: 0.18,
		irregularity: 0.16,
		scale: [1.16, 0.8, 1.08],
		strata: 0.46
	}, {
		role: 'masonry',
		textureHint: 'layered sandstone'
	}, {
		crystallinity: 0.06,
		family: 'sedimentary-clastic',
		fragmentation: 0.4,
		grainScale: 0.56,
		layering: 0.92,
		oxidationAffinity: 0.36,
		porosity: 0.58,
		rounding: 0.18,
		waterAffinity: 0.48
	}),
	volcanic: createRockProfileRecord('volcanic', {
		erosion: 0.36,
		fracture: 0.64,
		irregularity: 0.34,
		scale: [1.04, 1.08, 0.98],
		strata: 0.05
	}, {
		role: 'stone',
		textureHint: 'weathered volcanic stone'
	}, {
		crystallinity: 0.12,
		family: 'igneous-vesicular',
		fragmentation: 0.74,
		grainScale: 0.4,
		layering: 0.04,
		oxidationAffinity: 0.42,
		porosity: 0.82,
		rounding: 0.04,
		waterAffinity: 0.18
	}),
	talus: createRockProfileRecord('talus', {
		erosion: 0.2,
		fracture: 0.62,
		irregularity: 0.3,
		scale: [0.86, 1.2, 0.82],
		strata: 0.06
	}, {
		role: 'stone',
		textureHint: 'sharp talus stone'
	}, {
		crystallinity: 0.22,
		family: 'colluvial-fragment',
		fragmentation: 0.94,
		grainScale: 0.9,
		layering: 0.12,
		oxidationAffinity: 0.18,
		porosity: 0.2,
		rounding: 0.02,
		waterAffinity: 0.14
	}),
	glacial: createRockProfileRecord('glacial', {
		erosion: 0.4,
		fracture: 0.16,
		irregularity: 0.14,
		scale: [1.34, 0.7, 0.98],
		strata: 0.04
	}, {
		role: 'weatheredRock',
		textureHint: 'glacially worn stone'
	}, {
		crystallinity: 0.34,
		family: 'glacial-erratic',
		fragmentation: 0.24,
		grainScale: 1.12,
		layering: 0.06,
		oxidationAffinity: 0.2,
		porosity: 0.18,
		rounding: 0.72,
		waterAffinity: 0.62
	})
});
