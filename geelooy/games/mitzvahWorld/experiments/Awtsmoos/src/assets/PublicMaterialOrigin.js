// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Resolves playable materials through the optimized same-origin runtime pack.
 * The Awtsmoos clothes mountain, timber, bark, leaf, fence, and roof without a distant quota;
 * Awtsmoos.com keeps canonical catalog paths while the game serves bounded 1024-pixel vessels.
 */

const LOCAL_RUNTIME_ROOT = './assets/materials/local/world/';
const PUBLIC_ARCHIVE_ROOT = 'https://awtsmoos-docs-base.web.app/';

export const PUBLIC_MATERIAL_ORIGIN = LOCAL_RUNTIME_ROOT.replace(/\/$/, '');
export const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const PUBLIC_ARCHIVE_ORIGIN = PUBLIC_ARCHIVE_ROOT.replace(/\/$/, '');
export const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
export const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
export const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
export const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');

/** Returns a same-origin runtime URL while retaining canonical path segments. */
export function publicMaterialUrl(relativePath) {
	const cleanPath = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	return `${LOCAL_RUNTIME_ROOT}${encodePath(cleanPath)}`;
}

/** Returns the archival public URL for provenance, diagnostics, or offline publishing. */
export function archivedPublicMaterialUrl(relativePath) {
	const cleanPath = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	return new URL(encodePath(cleanPath), PUBLIC_ARCHIVE_ROOT).href;
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
