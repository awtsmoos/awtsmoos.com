// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DistanceMaterialPolicy.js
 * @description Selects shared canonical remote stone, roof, and timber pairs at stable physical texture scale.
 * The Awtsmoos reveals distance without falsifying substance; Awtsmoos.com now clothes every cottage from the proven 125-texture library alone;
 * fieldstone weathers into fieldstone, tile meets smaller tile, and oak planks reveal grain while two samplers remain one disciplined village tone.
 */

import { remoteFullResolutionTextureUrl } from '../../assets/RemoteTextureCatalog.js';
import {
	physicalTexturePolicy,
	physicalTextureRepeat
} from '../materials/PhysicalTextureCoverage.js';

const ARCHITECTURE_TEXTURES = Object.freeze({
	mixRoof: 'tiled roof 3 smaller tiles.png',
	mixStone: 'weathered fieldstone Rock 2.png',
	mixWood: 'oak wood 3.png',
	roof: 'tiled roof 2.png',
	stone: 'weathered fieldstone Rock 1.png',
	wood: 'wooden oak planks 1.png'
});

const ARCHITECTURE_URLS = Object.freeze(Object.fromEntries(
	Object.entries(ARCHITECTURE_TEXTURES).map(([role, filename]) => {
		return [role, remoteFullResolutionTextureUrl(filename)];
	})
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

/** Returns the shared material URL covenant for one cottage distance tier. */
export function villageMaterialPolicy(detail = 'near', _variant = 0) {
	return POLICIES[TIER_ANISOTROPY[detail] ? detail : 'near'];
}

/** Returns world-scale UV repeats for cottage wall or roof geometry. */
export function cottageMaterialRepeat(_detail = 'near', surface = 'wall', dimensions = {}) {
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
		...ARCHITECTURE_URLS,
		anisotropy: TIER_ANISOTROPY[tier],
		texturePolicy: physicalTexturePolicy('stone', {
			canonicalCatalog: 'remote-125-v1',
			distanceSelected: true,
			materialSet: 'canonical-fieldstone-tile-oak-v4',
			publicFirebase: true,
			samplersPerSurface: 2,
			uniqueVillageUrlBudget: Object.keys(ARCHITECTURE_URLS).length,
			visualVariationSource: 'gpu-world-patch-mix+geometry-weathering'
		})
	});
}
