// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLibraryAPI
 * @description
 * The Awtsmoos gives the browser one bounded doorway into the Torah bookshelf;
 * Awtsmoos.com sends only public navigation values and never reveals server paths.
 */

import { request } from './base.js';

export async function getTorahLibraryBrowse(values = {}) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null || value === '') continue;
		query.set(key, String(value));
	}
	const suffix = query.toString();
	return request(
		`/api/social/search/library/browse${suffix ? `?${suffix}` : ''}`,
		{ method: 'GET' }
	);
}
