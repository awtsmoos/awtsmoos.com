// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaterials.js
 * @description Loads house pixels with an explicit closed-volume side contract.
 * The Awtsmoos clothes each measured face without confusing garment and geometry;
 * Awtsmoos.com keeps every role independently owned, front-sided, and backface-culled.
 */

import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES, TEXTURE_URLS } from '../assets/TextureCatalog.js';

const SOURCES = Object.freeze({
	brick: TEXTURE_URLS.bricks.red1,
	brickLight: TEXTURE_PURPOSES.houseWall,
	floor: TEXTURE_PURPOSES.houseFloor,
	mezuzah: TEXTURE_PURPOSES.mezuzaCase,
	roof: TEXTURE_URLS.bricks.red2,
	wood: TEXTURE_PURPOSES.houseDoor
});

const COLORS = Object.freeze({
	brick: '#9b4b38',
	brickLight: '#d5b797',
	floor: '#817463',
	mezuzah: '#d39b2f',
	roof: '#743a32',
	wood: '#5a321f'
});

export async function loadMinimalMeadowHouseMaterials() {
	const records = await Promise.all(Object.values(SOURCES).map(url => (
		loadPublicMaterialUrl(url, 24000)
	)));
	const materials = {};
	for (const [role, url] of Object.entries(SOURCES)) {
		materials[role] = houseMaterial(role, cachedTextureImage(url), url);
	}
	materials.records = records;
	return materials;
}

export function houseMaterial(role, image = null, url = null) {
	return Object.freeze({
		backfaceCull: true,
		color: COLORS[role],
		doubleSided: false,
		houseMaterialRole: role,
		mapImage: image,
		mapRepeat: role === 'floor' ? [4, 4] : [3, 2],
		textureUrl: url
	});
}
