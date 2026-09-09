// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveCatalogLoader.js
 * @description Loads the complete Awtsmoos Drive material and hash inventories without binding discovery to a renderer or game.
 * The Awtsmoos renews every finite image and every remembered path; Awtsmoos.com reads both catalogs together so aliases, variants, and bytes can share one truthful remote well.
 */

import { awtsmoosDriveTexturePathUrl } from './AwtsmoosDriveTextureTransport.js';

export const AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL = awtsmoosDriveTexturePathUrl('catalog/materials.json');
export const AWTSMOOS_DRIVE_ASSET_INVENTORY_URL = awtsmoosDriveTexturePathUrl('catalog/asset-inventory.json');

/** Loads both complete catalogs concurrently and validates their public schemas. */
export async function loadAwtsmoosDriveCatalog(fetchFunction = globalThis.fetch) {
	if (typeof fetchFunction !== 'function') {
		throw new TypeError('Awtsmoos Drive catalog loading requires fetch().');
	}
	const [materials, inventory] = await Promise.all([
		fetchJson(fetchFunction, AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL),
		fetchJson(fetchFunction, AWTSMOOS_DRIVE_ASSET_INVENTORY_URL)
	]);
	if (materials?.schema !== 'awtsmoos-material-catalog/v1' || !Array.isArray(materials.records)) {
		throw new Error('Unsupported Awtsmoos Drive material catalog.');
	}
	if (inventory?.schema !== 'awtsmoos-asset-organization/v1' || !Array.isArray(inventory.assets)) {
		throw new Error('Unsupported Awtsmoos Drive asset inventory.');
	}
	return Object.freeze({ inventory, materials });
}

async function fetchJson(fetchFunction, url) {
	const response = await fetchFunction(url, { cache: 'force-cache' });
	if (!response?.ok) {
		throw new Error(`Awtsmoos Drive catalog request failed: ${response?.status || 'unknown'}`);
	}
	return response.json();
}
