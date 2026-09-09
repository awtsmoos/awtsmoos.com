// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialCatalogSemantics.mjs
 * @description Enriches generated public material records with procedural-core semantic authority and the current self-hosted origin.
 * Awtsmoos.com lets catalog JSON carry the same overlapping labels agents use at runtime, while provenance remains readable and URLs remain truthful.
 */

import { classifyAwtsmoosDriveTextureSemantics } from '../../../geelooy/libs/awtsmoos-procedural-core/src/exports/textures.js';

export const PUBLIC_MATERIAL_ORIGIN = 'https://awtsmoos.com/sites/firebase_drive_migration';
export const PUBLIC_MATERIAL_SEMANTIC_SCHEMA = 'awtsmoos-material-semantics/v1';

/** Enriches every physical catalog record without changing its stable ID or path. */
export function enrichPublicMaterialRecords(records, metadata = {}) {
	const descriptions = descriptionByVariant(metadata.entries || {});
	return records.map(record => {
		const sourceDescription = descriptions.get(record.variantKey) || record.sourceDescription || '';
		const semantics = classifyAwtsmoosDriveTextureSemantics({ ...record, sourceDescription });
		return {
			...record,
			...semantics,
			sourceDescription,
			url: publicMaterialUrl(record.path)
		};
	});
}

/** Rewrites inventory origin evidence without changing measured hashes or aliases. */
export function normalizePublicAssetInventory(inventory = {}) {
	return {
		...inventory,
		assets: (inventory.assets || []).map(asset => ({
			...asset,
			url: publicMaterialUrl(asset.path)
		})),
		legacyOrigin: inventory.origin || null,
		origin: PUBLIC_MATERIAL_ORIGIN
	};
}

function descriptionByVariant(entries) {
	const descriptions = new Map();
	for (const entry of Object.values(entries)) {
		const key = variantKey(entry.canonicalPath || '');
		if (key) descriptions.set(key, entry.sourceDescription || entry.sourceName || '');
	}
	return descriptions;
}

function variantKey(relativePath) {
	return String(relativePath || '')
		.replace(/^full-resolution\//, '')
		.replace(/^half-resolution\//, '')
		.replace(/^quarter-resolution\//, '')
		.toLowerCase();
}

function publicMaterialUrl(relativePath) {
	const encoded = String(relativePath || '')
		.split('/')
		.map(segment => encodeURIComponent(segment))
		.join('/');
	return `${PUBLIC_MATERIAL_ORIGIN}/${encoded}`;
}
