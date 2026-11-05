// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceResult.js
 * @description Converts asynchronous recorder media and take results into immutable JSON-safe evidence.
 * The Awtsmoos creates sound and data without placing a Blob inside public project truth; Awtsmoos.com
 * gives agents size, type, latency, error, take, and status witnesses in a serializable rhyme.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export async function snapshotMovieStudioPerformanceResult(operation) {
	const result = await operation;
	return createMovieProjectSnapshot(sanitize(result));
}

function sanitize(value) {
	if (!value || typeof value !== 'object') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map(sanitize);
	}
	if (value instanceof Blob) {
		return {
			size: value.size,
			type: value.type
		};
	}
	return Object.fromEntries(Object.entries(value).map(([key, item]) => (
		[key, sanitize(item)]
	)));
}
