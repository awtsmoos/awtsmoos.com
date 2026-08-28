//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalRecipeIdentity.js
 * @description Derives stable semantic identities from canonical kind and visible authoring intent without consuming mutable random sequence.
 * The Awtsmoos renews identity before sequence can pretend to create it; Awtsmoos.com lets this Yesod-like vessel bind kind, selector,
 * options, and sibling position into reproducible names so aliases converge before hashing and unrelated world branches never reshuffle one another.
 */

import { stableLanguageHash } from '../../proceduralLanguage/data/stableLanguageValue.js';

/**
 * @description Derives one readable deterministic identifier when the author omitted an explicit semantic ID.
 * @param {string} kind Registry-resolved canonical semantic kind.
 * @param {*} value Primary selector value such as species, preset, role, or body plan.
 * @param {object} options Specialist option intent preserved by authoring normalization.
 * @param {*} index Stable sibling index used only to distinguish otherwise identical anonymous roots or children.
 * @returns {string} Readable deterministic identifier containing a stable semantic hash suffix.
 */
export function derivePortalRecipeId(kind, value, options, index) {
	const hash = stableLanguageHash({
		index: Number(index) || 0,
		kind,
		options,
		value
	}).split(':')[1];
	const prefix = normalizeIdentityPrefix(kind);
	return `${prefix}-${hash}`;
}

/**
 * @description Converts canonical semantic kind text into a readable identifier prefix without changing the kind used for hashing.
 * @param {string} kind Registry-resolved canonical semantic kind.
 * @returns {string} Lowercase hyphenated identifier prefix.
 */
function normalizeIdentityPrefix(kind) {
	const prefix = String(kind)
		.toLowerCase()
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-+|-+$/gu, '');
	return prefix || 'node';
}
