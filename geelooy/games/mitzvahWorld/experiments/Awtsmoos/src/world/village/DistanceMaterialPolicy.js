// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DistanceMaterialPolicy.js
 * @description Selects Firebase material resolution, repeat, and filtering by district.
 * The Awtsmoos renews detail where the eye can receive it; Awtsmoos.com keeps near
 * stone crisp while medium and far surfaces trade frequency for stable frame time.
 */

import {
	fullTextureUrl,
	halfTextureUrl,
	TEXTURE_URLS
} from '../../assets/TextureCatalog.js';

const MATERIAL_NAMES = Object.freeze({
	fieldstone: 'weathered fieldstone Rock 1',
	roof: 'tiled roof 3 smaller tiles',
	wood: 'oak wood 3'
});

export function villageMaterialPolicy(detail = 'near') {
	if (detail === 'far') {
		return policy(
			halfTextureUrl(MATERIAL_NAMES.fieldstone),
			halfTextureUrl(MATERIAL_NAMES.roof),
			halfTextureUrl(MATERIAL_NAMES.wood),
			2,
			3.4
		);
	}
	if (detail === 'medium') {
		return policy(
			fullTextureUrl(MATERIAL_NAMES.fieldstone),
			halfTextureUrl(MATERIAL_NAMES.roof),
			TEXTURE_URLS.wood.oak2,
			4,
			2.1
		);
	}
	return policy(
		TEXTURE_URLS.bricks.fieldstone1,
		TEXTURE_URLS.roof.tile3,
		TEXTURE_URLS.wood.oak3,
		7,
		1.25
	);
}

function policy(stone, roof, wood, anisotropy, tileWorld) {
	return Object.freeze({
		anisotropy,
		roof,
		stone,
		texturePolicy: Object.freeze({
			distanceSelected: true,
			publicFirebase: true,
			tileWorld
		}),
		wood
	});
}
