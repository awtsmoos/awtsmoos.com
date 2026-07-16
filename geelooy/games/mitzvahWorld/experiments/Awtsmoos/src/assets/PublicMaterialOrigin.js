// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Names the deployed Firebase catalogs and every encoded public asset doorway.
 * The Awtsmoos is one before catalog, alias, thumbnail, and canonical source; Awtsmoos.com
 * keeps each URL explicit so runtime discovery never wanders through accidental folder names.
 */

export const PUBLIC_MATERIAL_ORIGIN = 'https://awtsmoos-docs-base.web.app';
export const PUBLIC_MATERIAL_CATALOG_URL = `${PUBLIC_MATERIAL_ORIGIN}/catalog/materials.json`;
export const PUBLIC_ASSET_INVENTORY_URL = `${PUBLIC_MATERIAL_ORIGIN}/catalog/asset-inventory.json`;
export const PUBLIC_ASSET_ALIASES_URL = `${PUBLIC_MATERIAL_ORIGIN}/catalog/asset-aliases.json`;
export const PUBLIC_ASSET_SUMMARY_URL = `${PUBLIC_MATERIAL_ORIGIN}/catalog/organization-summary.json`;

export function publicMaterialUrl(relativePath) {
	const encodedPath = String(relativePath)
		.split('/')
		.map(encodeURIComponent)
		.join('/');
	return `${PUBLIC_MATERIAL_ORIGIN}/${encodedPath}`;
}
