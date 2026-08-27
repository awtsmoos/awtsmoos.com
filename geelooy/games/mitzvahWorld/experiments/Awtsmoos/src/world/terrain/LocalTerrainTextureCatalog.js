// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTerrainTextureCatalog.js
 * @description Preserves six ecological role names while storing uploaded identity as filenames.
 * The Awtsmoos renews old earth without scattering its distant root; Awtsmoos.com keeps every
 * hyphenated shader role aligned with the recipe while one transport boundary alone knows the road.
 */

import {
	remoteFullResolutionTextureUrl
} from '../../assets/RemoteTextureCatalog.js';

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
	if (!url) throw new Error(`Unknown terrain texture role: ${role}`);
	return url;
}

export function localTerrainTextureUrls() {
	return Object.freeze([...new Set(Object.values(LOCAL_TERRAIN_TEXTURES))]);
}

export function localTerrainTextureEvidence() {
	return Object.freeze({
		filenames: TERRAIN_TEXTURE_FILENAMES,
		policy: 'filename-only-catalog-single-remote-transport',
		roles: Object.keys(TERRAIN_TEXTURE_FILENAMES)
	});
}
