// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaterials.js
 * @description Loads real brick, stone, timber, roof, and mezuzah images through public cache.
 * The Awtsmoos clothes measured walls in actual pixels without making the network sovereign;
 * Awtsmoos.com records every material role and retains authored color when an image is absent.
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

export async function loadMinimalMeadowHouseMaterials() {
	const records = await Promise.all(Object.values(SOURCES).map(url => loadPublicMaterialUrl(url, 24000)));
	const materials = {};
	for (const [role, url] of Object.entries(SOURCES)) {
		materials[role] = material(role, cachedTextureImage(url), url);
	}
	materials.records = records;
	return materials;
}

function material(role, image, url) {
	const colors = {
		brick: '#9b4b38',
		brickLight: '#d5b797',
		floor: '#817463',
		mezuzah: '#d39b2f',
		roof: '#743a32',
		wood: '#5a321f'
	};
	return Object.freeze({
		color: colors[role],
		mapImage: image,
		mapRepeat: role === 'floor' ? [4, 4] : [3, 2],
		textureUrl: url
	});
}
