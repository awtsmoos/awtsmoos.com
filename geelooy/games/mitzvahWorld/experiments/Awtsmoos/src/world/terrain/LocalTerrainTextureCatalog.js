// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTerrainTextureCatalog.js
 * @description Maps local ecological roles to inspected public full-resolution texture vessels.
 * The Awtsmoos renews meadow, mud, stone, leaf, sand, and earth through one trusted road;
 * Awtsmoos.com names that remote authority plainly, so diagnostics carry no contradictory load.
 */

import {
	remoteFullResolutionTextureUrl
} from '../../assets/RemoteTextureCatalog.js';

export const TERRAIN_TEXTURE_AUTHORITY = Object.freeze({
	catalog: 'RemoteTextureCatalog',
	policy: 'filename-role-map-content-addressed-public-transport',
	publicRemote: true,
	resolution: 'full'
});

export const TERRAIN_TEXTURE_FILENAMES = Object.freeze({
	'forest-leaf-floor': 'forest floor covered with leaves.png',
	'meadow-wet-grass': 'dirt grass 6.png',
	'mountain-stone': 'weathered fieldstone Rock 1.png',
	'shore-sand': 'sand 1.png',
	'stream-bank-mud': 'mud.png',
	'worn-earth': 'dirt 2.png'
});

export const LOCAL_TERRAIN_TEXTURES = Object.freeze(
	Object.fromEntries(Object.entries(TERRAIN_TEXTURE_FILENAMES).map(
		([role, filename]) => [role, remoteFullResolutionTextureUrl(filename)]
	))
);

export function localTerrainTextureUrl(role) {
	const url = LOCAL_TERRAIN_TEXTURES[role];
	if (!url) {
		throw new Error(`Unknown terrain texture role: ${role}`);
	}
	return url;
}

export function localTerrainTextureUrls() {
	return Object.freeze([...new Set(Object.values(LOCAL_TERRAIN_TEXTURES))]);
}

export function localTerrainTextureEvidence() {
	return Object.freeze({
		authority: TERRAIN_TEXTURE_AUTHORITY,
		filenames: TERRAIN_TEXTURE_FILENAMES,
		roles: Object.keys(TERRAIN_TEXTURE_FILENAMES),
		urls: localTerrainTextureUrls()
	});
}
