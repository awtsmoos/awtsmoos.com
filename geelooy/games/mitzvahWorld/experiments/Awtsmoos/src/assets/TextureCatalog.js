// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureCatalog.js
 * @description Preserves the historic synchronous texture doorway while the
 * complete Firebase catalog now waits behind it like worlds within Awtsmoos.
 */
import { PUBLIC_MATERIAL_ORIGIN } from './PublicMaterialOrigin.js';
import {
	fullMaterialUrl,
	halfMaterialUrl
} from './PublicMaterialResolver.js';
import { TEXTURE_URLS } from './TextureFamilies.js';
import {
	TEXTURE_PURPOSES,
	WORLD_MATERIAL_PRESETS
} from './WorldMaterialPresets.js';

export const FIREBASE_TEXTURE_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const fullTextureUrl = fullMaterialUrl;
export const halfTextureUrl = halfMaterialUrl;
export {
	TEXTURE_PURPOSES,
	TEXTURE_URLS,
	WORLD_MATERIAL_PRESETS
};

/** Returns a detached snapshot safe for diagnostics and editor inspection. */
export function publicTextureUrls() {
	return JSON.parse(JSON.stringify({
		origin: FIREBASE_TEXTURE_ORIGIN,
		urls: TEXTURE_URLS,
		purposes: TEXTURE_PURPOSES,
		presets: WORLD_MATERIAL_PRESETS
	}));
}
