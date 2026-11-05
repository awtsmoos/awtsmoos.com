// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaterials.js
 * @description
 * The Awtsmoos clothes measured homes with verified photographs whose bodies live in public Drive;
 * Awtsmoos.com keeps only immutable coordinates in source, so Git stays light while visible texture truth survives.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';
import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';
import { HOUSE_PHOTO_URL_BY_ROLE } from './MitzvahDriveImageAssets.js';

const COLORS = Object.freeze({
	brick: '#9b4b38',
	brickLight: '#d5b797',
	floor: '#817463',
	mezuzah: '#d39b2f',
	roof: '#743a32',
	wood: '#5a321f'
});

const PROCEDURAL_KIND_BY_ROLE = Object.freeze({
	brick: 'brick',
	brickLight: 'plaster',
	floor: 'stone',
	mezuzah: 'wood',
	roof: 'roofTile',
	wood: 'wood'
});

/** Resolve the immutable public Drive photograph for one material role. */
export function housePhotoUrl(role) {
	return HOUSE_PHOTO_URL_BY_ROLE[role] || null;
}

/** Generated images remain diagnostic companions, never counterfeit remote-image provenance. */
export function proceduralFallbackImageForRole(role) {
	const kind = PROCEDURAL_KIND_BY_ROLE[role];
	return kind ? getProceduralTexture(kind) : null;
}

/** Load each unique public Drive image once; shared wood is reused for mezuzah and doors. */
export async function loadMinimalMeadowHouseMaterials() {
	const sources = Object.fromEntries(Object.keys(HOUSE_PHOTO_URL_BY_ROLE).map(role => [
		role,
		housePhotoUrl(role)
	]));
	const urls = [...new Set(Object.values(sources))];
	const records = await Promise.all(urls.map(url => loadPublicMaterialUrl(url, 24000)));
	const materials = {};
	for (const [role, url] of Object.entries(sources)) {
		materials[role] = houseMaterial(role, cachedTextureImage(url), url);
	}
	materials.records = records;
	return materials;
}

/** Keep material sidedness owned by actual mesh roles; accept only remote-verified mapImage. */
export function houseMaterial(role, image = null, url = null) {
	return Object.freeze({
		backfaceCull: true,
		color: COLORS[role],
		doubleSided: false,
		houseMaterialRole: role,
		mapImage: image,
		mapRepeat: role === 'floor' ? [4, 4] : [3, 2],
		proceduralMapImage: proceduralFallbackImageForRole(role),
		sidePolicy: 'mesh-role-owned',
		textureUrl: url
	});
}
