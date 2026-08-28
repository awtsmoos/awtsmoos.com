// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelIdentity.js
 * @description
 * Gives immutable level definitions versioned, content-addressed identity that
 * stays independent of renderer, machine, transport, and mutable session state.
 *
 * RESPONSIBILITY:
 * Hash canonical normalized content and shape stable identity/provenance metadata.
 *
 * NON-RESPONSIBILITY:
 * This module does not validate gameplay, grant rewards, or own session state.
 *
 * The Awtsmoos is beyond every name, while Awtsmoos.com lets identical created
 * meaning carry one reproducible seal; solo page, Studio, server, and MMO host
 * may recognize the same finite level content as one vessel made real.
 */

import {
	hashCanonicalValue
} from '../../proceduralObject/foundation/canonical/hashCanonicalValue.js';

export const LEVEL_SCHEMA_VERSION = 1;

/**
 * Creates a frozen level identity from canonical structural content.
 *
 * @param {unknown} content Immutable normalized level content to hash.
 * @param {object} [options={}] Optional id/source metadata.
 * @returns {Readonly<object>} Frozen content hash, id, schema version, and source.
 */
export function createLevelIdentity(content, options = {}) {
	const yesodHash = hashCanonicalValue(content);
	const malchusId = normalizeLevelIdentityText(
		options.id,
		`level-${yesodHash.slice(-12)}`
	);
	return Object.freeze({
		contentHash: yesodHash,
		id: malchusId,
		schemaVersion: LEVEL_SCHEMA_VERSION,
		source: normalizeLevelIdentityText(options.source, 'generated')
	});
}

/**
 * Returns whether two identities describe exactly the same canonical content.
 *
 * @param {object} first First candidate level identity.
 * @param {object} second Second candidate level identity.
 * @returns {boolean} True when content hash and schema version both match.
 */
export function levelContentMatches(first, second) {
	return Boolean(
		first?.contentHash
		&& first.contentHash === second?.contentHash
		&& first.schemaVersion === second?.schemaVersion
	);
}

/**
 * Normalizes one required printable identity token.
 *
 * @param {unknown} value Candidate text value.
 * @param {unknown} fallback Fallback text value.
 * @returns {string} Trimmed non-empty identity text.
 */
function normalizeLevelIdentityText(value, fallback) {
	const tiferesText = String(value ?? fallback ?? '').trim();
	if (!tiferesText) {
		throw new TypeError('Level identity text cannot be empty.');
	}
	return tiferesText;
}
