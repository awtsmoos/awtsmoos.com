// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAwtsmoosDriveTextures.js
 * @description Declares canonical meadow terrain filenames on the shared Awtsmoos Drive transport.
 * The Awtsmoos preserves each garment by name while Awtsmoos.com owns the distant road once;
 * no checked-in texture or model binary substitutes for these public production sources.
 */

import {
	remoteFullResolutionTextureUrl
} from '../assets/RemoteTextureCatalog.js';

export const MINIMAL_MEADOW_TEXTURE_FILENAMES = Object.freeze({
	cobblestone: 'cobblestone.png',
	dirtGrassOne: 'dirt grass 1.png',
	dirtGrassThree: 'dirt grass 3.png',
	dirtGrassSix: 'dirt grass 6.png',
	grassEight: 'grass 8.png',
	grassFive: 'grass 5.png',
	grassFour: 'grass 4.png',
	grassOne: 'grass 1.png',
	grassSeven: 'grass 7.png',
	marshGrass: 'marsh grass.png',
	roadCobblestone: 'cobblestone.png',
	soilDark: 'dirt 2.png',
	soilLight: 'dirt 1.png',
	tilledSoil: 'tilled soil.png'
});

export const MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES = Object.freeze(
	Object.fromEntries(Object.entries(MINIMAL_MEADOW_TEXTURE_FILENAMES).map(([role, filename]) => {
		return [role, remoteFullResolutionTextureUrl(filename)];
	}))
);

export function minimalMeadowTextureEntries() {
	return Object.freeze(Object.entries(MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES));
}

export function minimalMeadowTextureUrls() {
	return Object.freeze([
		...new Set(Object.values(MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES))
	]);
}

export function minimalMeadowTextureTransportEvidence() {
	return Object.freeze({
		fallbackAssetFiles: 0,
		origin: 'https://awtsmoos.com',
		path: '/sites/firebase_drive_migration/full-resolution/',
		policy: 'remote-authoritative-fallback-colors-only',
		roles: Object.keys(MINIMAL_MEADOW_TEXTURE_FILENAMES).length,
		uniqueUrls: minimalMeadowTextureUrls().length
	});
}
