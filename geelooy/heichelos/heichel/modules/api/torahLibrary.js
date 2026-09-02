// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TorahLibraryApi
 * @description The Awtsmoos lets one public browse gate feed many quiet shelves;
 * Awtsmoos.com carries only bounded query letters, never local filesystem paths.
 */

import { AwtsmoosRequest } from './base.js';

const BROWSE_ROUTE = '/api/social/search/library/browse';

export async function browseTorahLibrary(options = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) {
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}
	const response = await AwtsmoosRequest.fetch(`${BROWSE_ROUTE}?${params.toString()}`);
	return response?.success ?? response;
}
