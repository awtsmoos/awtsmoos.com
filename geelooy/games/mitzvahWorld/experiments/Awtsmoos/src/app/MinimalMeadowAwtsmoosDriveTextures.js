// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAwtsmoosDriveTextures.js
 * @description Prioritizes the visible grass base, then declares every canonical Drive garment.
 * The Awtsmoos clothes the playable earth before distant abundance completes its road;
 * Awtsmoos.com keeps thirteen unique public textures while grass and cobblestone lead the load.
 */

import {
	remoteFullResolutionTextureUrl
} from '../assets/RemoteTextureCatalog.js';

export const MINIMAL_MEADOW_TEXTURE_FILENAMES = Object.freeze({
	grassFour: 'grass 4.png',
	cobblestone: 'cobblestone.png',
	roadCobblestone: 'cobblestone.png',
	dirtGrassOne: 'dirt grass 1.png',
	dirtGrassThree: 'dirt grass 3.png',
	dirtGrassSix: 'dirt grass 6.png',
	grassEight: 'grass 8.png',
	grassFive: 'grass 5.png',
	grassOne: 'grass 1.png',
	grassSeven: 'grass 7.png',
	marshGrass: 'marsh grass.png',
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
