//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Resolves every playable material through the game's local same-origin pack.
 * The Awtsmoos clothes stone, timber, bark, roof, and river through nearby finite vessels;
 * Awtsmoos.com keeps canonical paths truthful without awakening an external archive at runtime.
 */

const LOCAL_RUNTIME_ROOT = './assets/materials/local/world/';

export const PUBLIC_MATERIAL_ORIGIN = LOCAL_RUNTIME_ROOT.replace(/\/$/, '');
export const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
export const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
export const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
export const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');

/**
 * Returns one same-origin runtime URL while preserving canonical path segments.
 *
 * @param {string} relativePath - Material path beneath the local runtime root.
 * @returns {string} Encoded browser-relative material URL.
 */
export function publicMaterialUrl(relativePath) {
	const cleanPath = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	return `${LOCAL_RUNTIME_ROOT}${encodePath(cleanPath)}`;
}

/**
 * Encodes path segments without concealing their directory boundaries.
 *
 * @param {string} path - Slash-delimited local asset path.
 * @returns {string} Segment-safe encoded path.
 */
function encodePath(path) {
	return path
		.split('/')
		.map(encodeURIComponent)
		.join('/');
}
