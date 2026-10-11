// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMaterials.js
 * @description Loads house pixels while leaving architectural sidedness to each measured mesh role.
 * The Awtsmoos clothes wall, roof, threshold, and floor without confusing their geometry;
 * Awtsmoos.com keeps shared materials neutral so the surface policy may protect only thin walls.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES, TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { getProceduralTexture } from './BootstrapProceduralTerrainTextures.js';

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

/**
 * Maps each house material role to a procedural texture kind. The remote image
 * stays the primary mapImage (the remote-only provenance gate keeps policing that
 * slot); the procedural field rides alongside as proceduralMapImage so an offline
 * renderer has a reliable, honest fallback without tripping the gate.
 */
const PROCEDURAL_KIND_BY_ROLE = Object.freeze({
	brick: 'brick',
	brickLight: 'plaster',
	floor: 'stone',
	mezuzah: 'wood',
	roof: 'roofTile',
	wood: 'wood'
});

export function proceduralFallbackImageForRole(role) {
	const kind = PROCEDURAL_KIND_BY_ROLE[role];
	return kind ? getProceduralTexture(kind) : null;
}

export async function loadMinimalMeadowHouseMaterials() {
	const records = await Promise.all(Object.values(SOURCES).map((url) => {
		return loadPublicMaterialUrl(url, 24000);
	}));
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
		proceduralMapImage: proceduralFallbackImageForRole(role),
		sidePolicy: 'mesh-role-owned',
		textureUrl: url
	});
}
