// B"H

/**
 * @file api/vector/reindex/vectorExtractor.js
 * @chapter The Coordinates Are Read From Objects And Function-Shaped Handles
 * @description
 * Extracts supported vector fields from ordinary records or LiveHandle proxies
 * and normalizes them to finite Float32Array coordinates.
 */

const { vectorOf } = require('../query.js');

function extractVector(record) {
	if (!record || !['object', 'function'].includes(typeof record)) return null;
	for (const field of ['vector', 'embedding', 'vec']) {
		let candidate;
		try {
			candidate = record[field];
		} catch (_error) {
			continue;
		}
		const vector = vectorOf(candidate);
		if (vector && vector.length > 0) return vector;
	}
	return null;
}

module.exports = extractVector;
