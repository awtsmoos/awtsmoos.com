// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialCatalog.js
 * @description Loads and searches every published Firebase material while one
 * cached promise guards the world from repeated work before the Awtsmoos.
 */
import { PUBLIC_MATERIAL_CATALOG_URL } from './PublicMaterialOrigin.js';
import { resolveMaterialRecord } from './PublicMaterialResolver.js';

let catalogPromise = null;

/** Loads the generated catalog once and validates its public schema. */
export function loadPublicMaterialCatalog(fetchFunction = fetch) {
	if (!catalogPromise) {
		catalogPromise = fetchFunction(PUBLIC_MATERIAL_CATALOG_URL)
			.then(assertResponse)
			.then((response) => response.json())
			.then(validateCatalog)
			.catch((error) => {
				catalogPromise = null;
				throw error;
			});
	}
	return catalogPromise;
}

/** Searches loaded records by path, tags, kind, extension, and resolution. */
export async function searchPublicMaterials(query = '', options = {}) {
	const catalog = await loadPublicMaterialCatalog(options.fetchFunction);
	return searchMaterialRecords(catalog.records, query, options);
}

/** Resolves the strongest matching record for a requested quality tier. */
export async function resolvePublicMaterial(query, quality = 'high', options = {}) {
	const records = await searchPublicMaterials(query, options);
	if (!records.length) {
		throw new Error(`No public material matched: ${query}`);
	}
	return resolveMaterialRecord(records[0], quality);
}

/** Pure search helper used by tests, editors, and already-loaded catalogs. */
export function searchMaterialRecords(records, query = '', options = {}) {
	const token = normalize(query);
	return records
		.filter((record) => matchesOptions(record, options))
		.filter((record) => !token || searchableText(record).includes(token))
		.sort((left, right) => materialRank(right, token) - materialRank(left, token));
}

/** Clears only the in-memory promise, preserving immutable published data. */
export function resetPublicMaterialCatalog() {
	catalogPromise = null;
}

function assertResponse(response) {
	if (!response?.ok) {
		throw new Error(`Material catalog request failed: ${response?.status || 'unknown'}`);
	}
	return response;
}

function validateCatalog(catalog) {
	if (catalog?.schema !== 'awtsmoos-material-catalog/v1' || !Array.isArray(catalog.records)) {
		throw new Error('Unsupported public material catalog.');
	}
	return catalog;
}

function matchesOptions(record, options) {
	return (!options.kind || record.kind === options.kind)
		&& (!options.extension || record.extension === options.extension)
		&& (!options.tag || record.tags.includes(options.tag))
		&& (!options.alphaOnly || record.alphaCapable === true);
}

function searchableText(record) {
	return normalize([
		record.id,
		record.name,
		record.path,
		record.kind,
		record.extension,
		record.resolution,
		...(record.tags || [])
	].join(' '));
}

function materialRank(record, token) {
	let score = record.path.toLowerCase().includes(token) ? 20 : 0;
	score += record.resolution === 'source' ? 3 : 0;
	score += record.alphaCapable ? 2 : 0;
	score -= record.bytes / 1000000000;
	return score;
}

function normalize(value) {
	return String(value || '').trim().toLowerCase();
}
