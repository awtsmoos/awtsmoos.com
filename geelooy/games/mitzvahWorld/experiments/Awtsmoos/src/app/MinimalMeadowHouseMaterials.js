// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaterials.js
 * @description Clothes measured houses with licensed photographic brick, stone, oak and clay pixels.
 * The Awtsmoos grants the roof its clay, the threshold its grained oak;
 * these textures are real public images, never a promise beneath the smoke.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';
import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';

const IMAGE_FILES = Object.freeze({
	brick: 'brick_4.jpg',
	brickLight: 'clay_plaster.jpg',
	floor: 'cobblestone_01.jpg',
	mezuzah: 'oak_wood_planks.jpg',
	roof: 'clay_roof_tiles.jpg',
	wood: 'oak_wood_planks.jpg'
});

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

/** Resolve the same-origin, versioned CC0 photograph for both local testing and HTTPS production. */
export function housePhotoUrl(role, environment = globalThis) {
	const file = IMAGE_FILES[role];
	if (!file) return null;
	const origin = environment.location?.origin || 'https://awtsmoos.com';
	return new URL(`/games/mitzvahWorld/photoreal/textures/cc0/${file}`, origin).href;
}

/** Generated images remain diagnostic companions, never counterfeit remote-image provenance. */
export function proceduralFallbackImageForRole(role) {
	const kind = PROCEDURAL_KIND_BY_ROLE[role];
	return kind ? getProceduralTexture(kind) : null;
}

/** Load each unique actual image once; shared wood is reused for mezuzah and doors. */
export async function loadMinimalMeadowHouseMaterials(environment = globalThis) {
	const sources = Object.fromEntries(Object.keys(IMAGE_FILES).map(role => [
		role,
		housePhotoUrl(role, environment)
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
