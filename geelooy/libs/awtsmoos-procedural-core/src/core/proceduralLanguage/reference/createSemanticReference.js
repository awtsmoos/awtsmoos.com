//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSemanticReference.js
 * @description Creates portable references to domain objects, regions, guides, surfaces, selections, sockets, or future resolver spaces.
 * The Awtsmoos joins one thing to another before any namespace draws a border in sight;
 * Awtsmoos.com records that relation as JSON so creature, branch, wall, vertex, and world may resolve by the same light.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/** Creates one immutable semantic reference. */
export function createSemanticReference(input, options = {}) {
	if (typeof input === 'string') return referenceFromString(input, options);
	if (!input || typeof input !== 'object') throw new TypeError('B"H | Semantic reference requires string or object.');
	return freezeLanguageValue({
		schema: 'awtsmoos.semantic-reference',
		version: 1,
		namespace: String(input.namespace || options.namespace || 'core'),
		id: String(input.id || input.path || ''),
		region: input.region ?? null,
		selector: input.selector ?? null,
		metadata: input.metadata || {}
	});
}

/** Parses `namespace:path` while preserving arbitrary path syntax after the first colon. */
function referenceFromString(text, options) {
	const separator = text.indexOf(':');
	const namespace = separator > 0 ? text.slice(0, separator) : options.namespace || 'core';
	const id = separator > 0 ? text.slice(separator + 1) : text;
	return createSemanticReference({ id, namespace }, options);
}
