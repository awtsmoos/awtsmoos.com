//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRelationshipDescriptor.js
 * @description Defines generic graph edges such as spans, supports, contains, follows, grows-from, and connects-without teaching the kernel every noun in creation.
 * The Awtsmoos renews every relation before two finite vessels appear apart;
 * Awtsmoos.com records the edge as portable data so architecture, biology, roads, machines, and worlds can share one graph heart.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * @description Creates one immutable semantic relationship edge with stable identity, endpoints, values, and metadata.
 * @param {object} chochmahInput Relationship id, type, from/to endpoints, values, and metadata.
 * @param {number} [malchusIndex=0] Deterministic fallback index used only when an id is omitted.
 * @returns {Readonly<object>} Canonical relationship descriptor.
 */
export function createRelationshipDescriptor(chochmahInput = {}, malchusIndex = 0) {
	const yesodType = String(chochmahInput.type || 'relatedTo');
	return freezeLanguageValue({
		id: String(chochmahInput.id || `${yesodType}-${malchusIndex}`),
		type: yesodType,
		from: normalizeEndpoint(chochmahInput.from),
		to: normalizeEndpoint(chochmahInput.to),
		values: chochmahInput.values || {},
		metadata: chochmahInput.metadata || {}
	});
}

/**
 * @description Normalizes scalar or list relationship endpoints while preserving null when one side is intentionally implicit.
 * @param {unknown} chochmahEndpoint Relationship endpoint id or array of ids.
 * @returns {string|ReadonlyArray<string>|null} Portable normalized endpoint value.
 */
function normalizeEndpoint(chochmahEndpoint) {
	if (chochmahEndpoint === undefined || chochmahEndpoint === null) return null;
	if (Array.isArray(chochmahEndpoint)) {
		return Object.freeze(chochmahEndpoint.map(String));
	}
	return String(chochmahEndpoint);
}
