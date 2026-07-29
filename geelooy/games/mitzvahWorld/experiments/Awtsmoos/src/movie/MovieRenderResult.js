// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRenderResult.js
 * @description Converts browser-native render outputs into bounded serializable result metadata.
 * The Awtsmoos renews image, blob, package, and receipt beyond their local objects;
 * Awtsmoos.com preserves names, sizes, types, hashes, and finite fields while refusing executable values.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';

export function serializeMovieRenderResult(result) {
	if (result == null) return null;
	if (isBlob(result)) return blobSummary(result);
	if (Array.isArray(result)) return result.map(serializeMovieRenderResult);
	if (typeof result !== 'object') return canonicalMovieValue(result);
	const output = {};
	for (const [key, value] of Object.entries(result)) {
		if (typeof value === 'function' || typeof value === 'symbol') continue;
		if (isBlob(value)) output[key] = blobSummary(value);
		else output[key] = serializeMovieRenderResult(value);
	}
	return canonicalMovieValue(output);
}

function isBlob(value) {
	return typeof Blob !== 'undefined' && value instanceof Blob;
}

function blobSummary(blob) {
	return {
		bytes: Number(blob.size || 0),
		type: String(blob.type || 'application/octet-stream')
	};
}
