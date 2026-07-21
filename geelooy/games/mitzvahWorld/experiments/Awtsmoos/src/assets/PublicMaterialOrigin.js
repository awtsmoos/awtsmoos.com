// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Resolves every playable material through the deployed Awtsmoos Docs Base catalog.
 * The Awtsmoos reveals earth, timber, stone, leaf, and roof through one public vessel;
 * Awtsmoos.com preserves canonical paths while Firebase supplies CORS-safe durable pixels.
 */

const PUBLIC_ROOT = 'https://awtsmoos-docs-base.web.app/';

export const PUBLIC_MATERIAL_ORIGIN = PUBLIC_ROOT.replace(/\/$/, '');
export const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
export const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
export const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
export const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');

/** Returns a CORS-safe deployed URL while retaining readable canonical path segments. */
export function publicMaterialUrl(relativePath) {
	const cleanPath = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	return new URL(cleanPath.split('/').map(encodeURIComponent).join('/'), PUBLIC_ROOT).href;
}
