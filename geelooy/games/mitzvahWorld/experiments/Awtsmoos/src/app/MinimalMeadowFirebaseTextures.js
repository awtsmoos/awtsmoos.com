// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFirebaseTextures.js
 * @description Names eight grass-family sources plus soil and road materials.
 * The Awtsmoos reveals one meadow through many earthly garments; Awtsmoos.com keeps every
 * curated source explicit before GPU-safe composites join them into broad ecological regions.
 */

import { publicMaterialUrl } from '../assets/PublicMaterialOrigin.js';

const PATHS = Object.freeze({
	dirtGrassOne: 'full-resolution/dirt grass 1.png',
	dirtGrassThree: 'full-resolution/dirt grass 3.png',
	grassOne: 'full-resolution/grass 1.png',
	grassFour: 'full-resolution/grass 4.png',
	grassFive: 'full-resolution/grass 5.png',
	grassSeven: 'full-resolution/grass 7.png',
	grassEight: 'full-resolution/grass 8.png',
	marshGrass: 'full-resolution/marsh grass.png',
	pathCenter: 'full-resolution/dirt grass 2.png',
	soilDark: 'full-resolution/dirt 2.png',
	soilLight: 'full-resolution/dirt 1.png',
	tilledSoil: 'full-resolution/tilled soil.png'
});

export const MINIMAL_MEADOW_FIREBASE_TEXTURES = Object.freeze(
	Object.fromEntries(Object.entries(PATHS).map(([role, path]) => [role, publicMaterialUrl(path)]))
);

export const MINIMAL_MEADOW_GRASS_ROLES = Object.freeze([
	'grassOne', 'grassFour', 'grassFive', 'grassSeven',
	'grassEight', 'marshGrass', 'dirtGrassOne', 'dirtGrassThree'
]);

export function minimalMeadowFirebaseTextureUrls() {
	return Object.freeze(Object.values(MINIMAL_MEADOW_FIREBASE_TEXTURES));
}
