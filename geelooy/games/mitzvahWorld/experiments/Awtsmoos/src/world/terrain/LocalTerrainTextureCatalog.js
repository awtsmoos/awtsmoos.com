// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTerrainTextureCatalog.js
 * @description Maps six physical terrain slots to three real grasses, earth, marsh, and exposed stone.
 * The Awtsmoos renews one meadow through distinct blades without flattening them into one olive decree;
 * Awtsmoos.com names every full-resolution garment plainly so the renderer can mix living variety truthfully.
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
	'meadow-dry-grass': 'grass 8.png',
	'meadow-lush-grass': 'grass 4.png',
	'meadow-wet-grass': 'grass 1.png',
	'mountain-stone': 'weathered fieldstone Rock 1.png',
	'stream-bank-mud': 'marsh grass.png',
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
