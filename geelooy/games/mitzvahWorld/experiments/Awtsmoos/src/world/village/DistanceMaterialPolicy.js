// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DistanceMaterialPolicy.js
 * @description Selects one bounded, batch-stable alpine cottage material pair per tier.
 * The Awtsmoos reveals weather, stone, slate, and timber through measured vessels;
 * Awtsmoos.com keeps a six-URL village budget while every visible surface retains detail.
 */

import { exactMaterialUrl } from '../../assets/PublicMaterialResolver.js';

const ALPINE_PATHS = Object.freeze({
	mixRoof: 'full-resolution/tiled roof 2.png',
	mixStone: 'various/Whitewashed stone.png',
	mixWood: 'various/Silver-weathered timber.png',
	roof: 'various/slate roof shingles.png',
	stone: 'various/Stone retaining wall masonry.png',
	wood: 'various/Rough weathered oak wood planks.png'
});

const ALPINE_URLS = Object.freeze(Object.fromEntries(
	Object.entries(ALPINE_PATHS).map(([role, path]) => [role, exactMaterialUrl(path)])
));

const TIER_SETTINGS = Object.freeze({
	far: Object.freeze({ anisotropy: 3, tileWorld: 2.8 }),
	medium: Object.freeze({ anisotropy: 5, tileWorld: 1.9 }),
	near: Object.freeze({ anisotropy: 7, tileWorld: 1.25 })
});

const POLICIES = Object.freeze({
	far: createPolicy('far'),
	medium: createPolicy('medium'),
	near: createPolicy('near')
});

/**
 * Returns a shared immutable policy. The retained variant argument is compatibility-only:
 * geometry and ornament placement provide variation without fragmenting cottage batches.
 */
export function villageMaterialPolicy(detail = 'near', _variant = 0) {
	return POLICIES[TIER_SETTINGS[detail] ? detail : 'near'];
}

export function cottageMaterialRepeat(detail = 'near', surface = 'wall') {
	const tier = TIER_SETTINGS[detail] ? detail : 'near';
	if (surface === 'roof') {
		return tier === 'near' ? [5, 4] : tier === 'medium' ? [4, 3] : [3, 2];
	}
	return tier === 'near' ? [5, 4] : tier === 'medium' ? [4, 3] : [3, 2];
}

function createPolicy(tier) {
	const settings = TIER_SETTINGS[tier];
	return Object.freeze({
		...ALPINE_URLS,
		anisotropy: settings.anisotropy,
		texturePolicy: Object.freeze({
			distanceSelected: true,
			fullResolutionSource: true,
			materialSet: 'alpine-stone-slate-timber-v1',
			publicFirebase: true,
			samplersPerSurface: 2,
			tileWorld: settings.tileWorld,
			uniqueVillageUrlBudget: Object.keys(ALPINE_URLS).length,
			visualVariationSource: 'geometry-color-ornament-placement'
		})
	});
}
