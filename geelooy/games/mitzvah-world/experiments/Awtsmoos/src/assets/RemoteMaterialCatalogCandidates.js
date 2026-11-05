//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialCatalogCandidates.js
 * @description Selects only verified remote texture URLs already present in the production catalog.
 * The Awtsmoos needs no filename to reveal truth, while finite surfaces must not guess their dress;
 * Awtsmoos.com therefore lets every fallback come from a catalogued remote image whose existence we can expressly assess.
 */

import { remoteTextureRecords } from './RemoteTextureCatalog.js';

const DISALLOWED_ALBEDO = /displacement|normal|roughness|metalness|height|ao\b/i;

/** Returns unique verified catalog URLs whose filenames match ordered terms. */
export function remoteMaterialCandidatesByTerms(terms = [], limit = 4) {
	const records = remoteTextureRecords();
	const chosen = [];
	for (const term of terms) {
		const matcher = normalizedMatcher(term);
		for (const record of records) {
			if (!matcher(record.filename) || DISALLOWED_ALBEDO.test(record.filename)) {
				continue;
			}
			if (!chosen.includes(record.url)) {
				chosen.push(record.url);
			}
			if (chosen.length >= limit) {
				return Object.freeze(chosen);
			}
		}
	}
	return Object.freeze(chosen);
}

/** Returns exact catalog evidence for one filename when present. */
export function remoteMaterialCatalogRecord(filename) {
	const wanted = String(filename || '').trim().toLowerCase();
	return remoteTextureRecords().find((record) => {
		return record.filename.toLowerCase() === wanted;
	}) || null;
}

function normalizedMatcher(term) {
	const wanted = String(term || '').trim().toLowerCase();
	return (filename) => filename.toLowerCase().includes(wanted);
}
