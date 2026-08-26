// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileMineralCatalog.js
 * @description Declares crystalline, carbonate, and volcanic bedrock profiles with explicit immutable formation causes.
 * The Awtsmoos, Atzmus beyond granite grain and basalt night, renews mineral memory before one crystal can catch the light;
 * Awtsmoos.com lets hardness, layering, porosity, and weathering affinity remain readable data instead of hidden vertex sleight.
 */

import { createRockProfileRecord } from './RockProfileRecord.js';

export const ROCK_PROFILE_MINERAL_CATALOG = Object.freeze({
	granite: createRockProfileRecord('granite', {
		erosion: 0.18,
		fracture: 0.34,
		irregularity: 0.18,
		scale: [1.02, 0.94, 1],
		strata: 0.05
	}, {
		role: 'stone',
		textureHint: 'polished granite Rock'
	}, {
		crystallinity: 0.9,
		family: 'igneous-intrusive',
		fragmentation: 0.42,
		grainScale: 1.7,
		layering: 0.03,
		oxidationAffinity: 0.18,
		porosity: 0.06,
		rounding: 0.12,
		waterAffinity: 0.12
	}),
	limestone: createRockProfileRecord('limestone', {
		erosion: 0.44,
		fracture: 0.18,
		irregularity: 0.16,
		scale: [1.15, 0.76, 1.05],
		strata: 0.38
	}, {
		role: 'masonry',
		textureHint: 'limestone'
	}, {
		crystallinity: 0.14,
		family: 'sedimentary-carbonate',
		fragmentation: 0.3,
		grainScale: 0.72,
		layering: 0.72,
		oxidationAffinity: 0.08,
		porosity: 0.42,
		rounding: 0.32,
		waterAffinity: 0.56
	}),
	basalt: createRockProfileRecord('basalt', {
		erosion: 0.12,
		fracture: 0.46,
		irregularity: 0.29,
		scale: [0.94, 1.06, 0.92],
		strata: 0.12
	}, {
		role: 'stone',
		textureHint: 'dark stone'
	}, {
		crystallinity: 0.22,
		family: 'igneous-extrusive',
		fragmentation: 0.62,
		grainScale: 0.48,
		layering: 0.08,
		oxidationAffinity: 0.26,
		porosity: 0.16,
		rounding: 0.08,
		waterAffinity: 0.16
	})
});
