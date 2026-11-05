// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OrganizedAssetCatalog.js
 * @description Loads the deployed inventory and aliases once, then exposes category queries.
 * The Awtsmoos is not delayed by metadata; Awtsmoos.com begins this catalog beside gameplay,
 * caches one promise, and lets editor or runtime consumers ask for stable semantic records later.
 */

import {
	PUBLIC_ASSET_ALIASES_URL,
	PUBLIC_ASSET_INVENTORY_URL
} from './PublicMaterialOrigin.js';
import {
	organizedAssetCategories,
	searchOrganizedAssets,
	validateOrganizedAssetCatalog
} from './OrganizedAssetQuery.js';

let catalogPromise = null;

export function loadOrganizedAssetCatalog(fetchFunction = fetch) {
	if (!catalogPromise) {
		catalogPromise = Promise.all([
			fetchJson(fetchFunction, PUBLIC_ASSET_INVENTORY_URL),
			fetchJson(fetchFunction, PUBLIC_ASSET_ALIASES_URL)
		]).then(([inventory, aliases]) => buildCatalog(inventory, aliases))
			.catch(error => {
				catalogPromise = null;
				throw error;
			});
	}
	return catalogPromise;
}

export async function searchOrganizedAssetCatalog(query = '', options = {}) {
	const catalog = await loadOrganizedAssetCatalog(options.fetchFunction);
	return searchOrganizedAssets(catalog.assets, query, options);
}

export async function organizedAssetCategoryIndex(options = {}) {
	const catalog = await loadOrganizedAssetCatalog(options.fetchFunction);
	return catalog.categories;
}

export async function resolveOrganizedAssetAlias(path, options = {}) {
	const catalog = await loadOrganizedAssetCatalog(options.fetchFunction);
	return catalog.aliases.get(path) || null;
}

export function resetOrganizedAssetCatalog() {
	catalogPromise = null;
}

function buildCatalog(inventory, aliasCatalog) {
	const validated = validateOrganizedAssetCatalog(inventory);
	if (aliasCatalog?.schema !== 'awtsmoos-asset-organization/v1') {
		throw new Error('Unsupported organized asset alias catalog.');
	}
	const aliases = new Map(
		(aliasCatalog.aliases || []).map(alias => [alias.source, Object.freeze({ ...alias })])
	);
	return Object.freeze({
		aliases,
		assets: validated.assets,
		categories: organizedAssetCategories(validated.assets),
		origin: validated.origin,
		schema: validated.schema
	});
}

async function fetchJson(fetchFunction, url) {
	const response = await fetchFunction(url);
	if (!response?.ok) {
		throw new Error(`Organized asset catalog request failed: ${response?.status || 'unknown'}`);
	}
	return response.json();
}
