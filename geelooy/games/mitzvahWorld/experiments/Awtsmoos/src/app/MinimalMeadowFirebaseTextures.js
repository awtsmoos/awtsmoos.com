// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFirebaseTextures.js
 * @description Preserves the historic export name while sourcing filename-only Awtsmoos textures.
 * The Awtsmoos renews old vessels with a clearer light; Awtsmoos.com keeps compatibility intact
 * while grass, dirt, shoulder, marsh, and cobblestone now come from the uploaded full-resolution set.
 */

import {
	remoteFullResolutionTextureUrl
} from '../assets/RemoteTextureCatalog.js';

export const MINIMAL_MEADOW_TEXTURE_FILENAMES = Object.freeze({
	dirtGrassOne: 'dirt grass 1.png',
	dirtGrassSix: 'dirt grass 6.png',
	dirtGrassThree: 'dirt grass 3.png',
	grassEight: 'grass 8.png',
	grassFive: 'grass 5.png',
	grassFour: 'grass 4.png',
	grassOne: 'grass 1.png',
	grassSeven: 'grass 7.png',
	marshGrass: 'marsh grass.png',
	pathCenter: 'cobblestone.png',
	roadCobblestone: 'cobblestone.png',
	soilDark: 'dirt 2.png',
	soilLight: 'dirt 1.png',
	tilledSoil: 'tilled soil.png'
});

export const MINIMAL_MEADOW_FIREBASE_TEXTURES = Object.freeze(
	Object.fromEntries(Object.entries(MINIMAL_MEADOW_TEXTURE_FILENAMES).map(
		([role, filename]) => [role, remoteFullResolutionTextureUrl(filename)]
	))
);

export const MINIMAL_MEADOW_GRASS_ROLES = Object.freeze([
	'grassOne',
	'grassFour',
	'grassFive',
	'grassSeven',
	'grassEight',
	'marshGrass',
	'dirtGrassOne',
	'dirtGrassThree',
	'dirtGrassSix'
]);

export function minimalMeadowFirebaseTextureUrls() {
	return Object.freeze([...new Set(Object.values(MINIMAL_MEADOW_FIREBASE_TEXTURES))]);
}
