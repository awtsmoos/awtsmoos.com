// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DistanceMaterialPolicy.js
 * @description Selects hydratable alpine material pairs at one stable physical texture scale.
 * The Awtsmoos reveals distance without falsifying substance; Awtsmoos.com keeps stone,
 * slate, and timber exact while replacing the one runtime-log-proven blocked timber doorway.
 */

import { exactMaterialUrl } from '../../assets/PublicMaterialResolver.js';
import {
	physicalTexturePolicy,
	physicalTextureRepeat
} from '../materials/PhysicalTextureCoverage.js';

const ALPINE_PATHS = Object.freeze({
	mixRoof: 'full-resolution/tiled roof 2.png',
	mixStone: 'various/Whitewashed stone.png',
	mixWood: 'full-resolution/oak wood 3.png',
	roof: 'various/slate roof shingles.png',
	stone: 'various/Stone retaining wall masonry.png',
	wood: 'various/Rough weathered oak wood planks.png'
});

const ALPINE_URLS = Object.freeze(Object.fromEntries(
	Object.entries(ALPINE_PATHS).map(([role, path]) => [role, exactMaterialUrl(path)])
));

const TIER_ANISOTROPY = Object.freeze({
	far: 4,
	medium: 6,
	near: 8
});

const POLICIES = Object.freeze({
	far: createPolicy('far'),
	medium: createPolicy('medium'),
	near: createPolicy('near')
});

export function villageMaterialPolicy(detail = 'near', _variant = 0) {
	return POLICIES[TIER_ANISOTROPY[detail] ? detail : 'near'];
}

export function cottageMaterialRepeat(
	_detail = 'near',
	surface = 'wall',
	dimensions = {}
) {
	if (surface === 'roof') {
		const slopeLength = Math.hypot(
			(Number(dimensions.width) || 7) / 2,
			Number(dimensions.roofRise) || 2.4
		) * 2;
		return physicalTextureRepeat(
			'roof',
			slopeLength,
			Number(dimensions.depth) || 6
		);
	}
	return physicalTextureRepeat(
		'stone',
		Math.max(Number(dimensions.width) || 7, Number(dimensions.depth) || 6),
		Number(dimensions.wallHeight) || 5
	);
}

function createPolicy(tier) {
	return Object.freeze({
		...ALPINE_URLS,
		anisotropy: TIER_ANISOTROPY[tier],
		texturePolicy: physicalTexturePolicy('stone', {
			distanceSelected: true,
			materialSet: 'alpine-stone-slate-timber-v3',
			publicFirebase: true,
			samplersPerSurface: 2,
			uniqueVillageUrlBudget: Object.keys(ALPINE_URLS).length,
			visualVariationSource: 'geometry-weathering-ornament-placement'
		})
	});
}
