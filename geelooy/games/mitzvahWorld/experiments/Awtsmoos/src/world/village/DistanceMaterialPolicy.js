// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DistanceMaterialPolicy.js
 * @description Selects a bounded full-resolution cottage palette for each distance tier.
 * The Awtsmoos reveals endless variation through measured vessels; Awtsmoos.com keeps
 * full Firebase stone, roof, and timber sources while equal visible tiers share GPU state.
 */

import { fullTextureUrl } from '../../assets/TextureCatalog.js';

const PALETTES = Object.freeze({
	far: Object.freeze({
		roof: 'tiled roof 2',
		stone: 'limestone bricks 1',
		wood: 'oak wood 2'
	}),
	medium: Object.freeze({
		roof: 'tiled roof 4',
		stone: 'weathered Red bricks 1',
		wood: 'wooden oak planks 1'
	}),
	near: Object.freeze({
		roof: 'tiled roof 3 smaller tiles',
		stone: 'weathered fieldstone Rock 1',
		wood: 'oak wood 3'
	})
});

export function villageMaterialPolicy(detail = 'near', variant = 0) {
	const tier = PALETTES[detail] ? detail : 'near';
	const palette = PALETTES[tier];
	return Object.freeze({
		anisotropy: tier === 'near' ? 7 : tier === 'medium' ? 5 : 3,
		roof: fullTextureUrl(palette.roof),
		stone: fullTextureUrl(palette.stone),
		wood: fullTextureUrl(palette.wood),
		texturePolicy: Object.freeze({
			distanceSelected: true,
			fullResolutionSource: true,
			publicFirebase: true,
			tileWorld: tier === 'near' ? 1.25 : tier === 'medium' ? 1.9 : 2.8,
			variant: Math.abs(Number(variant) || 0),
			visualVariationSource: 'geometry-color-ornament-placement'
		})
	});
}

export function cottageMaterialRepeat(detail = 'near', surface = 'wall') {
	const tier = PALETTES[detail] ? detail : 'near';
	if (surface === 'roof') {
		return tier === 'near' ? [5, 4] : tier === 'medium' ? [4, 3] : [3, 2];
	}
	return tier === 'near' ? [5, 4] : tier === 'medium' ? [4, 3] : [3, 2];
}
