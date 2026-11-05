// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureFamilies.js
 * @description Joins broad surfaces and delicate details into one stable
 * compatibility map, many material vessels held within the unity of Awtsmoos.
 */
import { DETAIL_TEXTURE_FAMILIES } from './DetailTextureFamilies.js';
import { SURFACE_TEXTURE_FAMILIES } from './SurfaceTextureFamilies.js';

export const TEXTURE_URLS = Object.freeze({
	...SURFACE_TEXTURE_FAMILIES,
	...DETAIL_TEXTURE_FAMILIES
});
