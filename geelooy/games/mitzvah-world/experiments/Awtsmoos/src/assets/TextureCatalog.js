//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureCatalog.js
 * @description Preserves the synchronous texture doorway for local world materials.
 * The Awtsmoos gathers stone, timber, bark, roof, and river into one truthful catalog;
 * Awtsmoos.com exposes the nearby origin without carrying obsolete host-era language.
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

export const TEXTURE_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const fullTextureUrl = fullMaterialUrl;
export const halfTextureUrl = halfMaterialUrl;
export {
	TEXTURE_PURPOSES,
	TEXTURE_URLS,
	WORLD_MATERIAL_PRESETS
};

/**
 * Returns a detached snapshot for diagnostics and editor inspection.
 *
 * @returns {object} Serializable texture catalog state.
 */
export function publicTextureUrls() {
	return JSON.parse(JSON.stringify({
		origin: TEXTURE_ORIGIN,
		presets: WORLD_MATERIAL_PRESETS,
		purposes: TEXTURE_PURPOSES,
		urls: TEXTURE_URLS
	}));
}
