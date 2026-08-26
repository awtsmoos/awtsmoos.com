// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileFoundationCatalog.js
 * @description Declares foundational weathered, rounded, and fractured rock profiles as immutable geological data.
 * The Awtsmoos, Atzmus beyond boulder and shard, renews every edge and worn face before one catalog can measure their part;
 * Awtsmoos.com lets familiar stones receive deeper formation causes while their historic geometry remains written at the heart.
 */

import { createRockProfileRecord } from './RockProfileRecord.js';

export const ROCK_PROFILE_FOUNDATION_CATALOG = Object.freeze({
	fieldstone: createRockProfileRecord('fieldstone', {
		erosion: 0.52,
		fracture: 0.28,
		irregularity: 0.24,
		scale: [1.08, 0.82, 0.96],
		strata: 0.08
	}, {
		role: 'weatheredRock',
		textureHint: 'weathered fieldstone Rock'
	}, {
		crystallinity: 0.2,
		family: 'weathered',
		fragmentation: 0.38,
		grainScale: 1.15,
		layering: 0.1,
		oxidationAffinity: 0.32,
		porosity: 0.28,
		rounding: 0.48,
		waterAffinity: 0.4
	}),
	boulder: createRockProfileRecord('boulder', {
		erosion: 0.34,
		fracture: 0.24,
		irregularity: 0.31,
		scale: [1.3, 1.04, 1.16],
		strata: 0.09
	}, {
		role: 'weatheredRock',
		textureHint: 'large weathered boulder'
	}, {
		crystallinity: 0.34,
		family: 'massive',
		fragmentation: 0.28,
		grainScale: 1.35,
		layering: 0.08,
		oxidationAffinity: 0.24,
		porosity: 0.2,
		rounding: 0.3,
		waterAffinity: 0.26
	}),
	riverstone: createRockProfileRecord('riverstone', {
		erosion: 0.82,
		fracture: 0.07,
		irregularity: 0.13,
		scale: [1.14, 0.72, 0.94],
		strata: 0.04
	}, {
		role: 'weatheredRock',
		textureHint: 'smooth river stone'
	}, {
		crystallinity: 0.24,
		family: 'alluvial',
		fragmentation: 0.1,
		grainScale: 0.78,
		layering: 0.04,
		oxidationAffinity: 0.16,
		porosity: 0.16,
		rounding: 0.92,
		waterAffinity: 0.94
	}),
	shard: createRockProfileRecord('shard', {
		erosion: 0.08,
		fracture: 0.9,
		irregularity: 0.28,
		scale: [0.82, 1.32, 0.56],
		strata: 0.2
	}, {
		role: 'stone',
		textureHint: 'fractured angular stone'
	}, {
		crystallinity: 0.28,
		family: 'fractured',
		fragmentation: 0.96,
		grainScale: 0.94,
		layering: 0.22,
		oxidationAffinity: 0.12,
		porosity: 0.14,
		rounding: 0.03,
		waterAffinity: 0.1
	})
});
