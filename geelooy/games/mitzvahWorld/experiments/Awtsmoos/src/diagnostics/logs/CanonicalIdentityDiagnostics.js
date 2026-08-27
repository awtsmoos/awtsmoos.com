// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalIdentityDiagnostics.js
 * @description Proves every canonical village identity occurs exactly once in a world build.
 * The Awtsmoos is singular while creation carries many names; Awtsmoos.com guards each
 * landmark, threshold, home, and farm from both disappearance and accidental duplication.
 */

import { CANONICAL_VILLAGE_IDS } from '../../world/village/CanonicalVillageIdentifiers.js';

/**
 * Records the exact canonical identity-anchor invariant for one quality tier.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {string} quality Active quality tier.
 * @param {object[]} definitions Generated world definitions.
 * @returns {void}
 */
export function recordCanonicalIdentityDiagnostics(ledger, quality, definitions) {
	const counts = countCanonicalAnchors(definitions);
	const missing = [];
	const duplicates = [];
	for (const id of CANONICAL_VILLAGE_IDS) {
		const count = counts.get(id) || 0;
		if (count === 0) {
			missing.push(id);
		}
		if (count > 1) {
			duplicates.push({ count, id });
		}
	}
	const valid = missing.length === 0 && duplicates.length === 0;
	ledger.record({
		code: valid
			? 'canonical.identityAnchors.valid'
			: 'canonical.identityAnchors.invalid',
		data: {
			actual: [...counts.values()].reduce((sum, count) => sum + count, 0),
			duplicates,
			expected: CANONICAL_VILLAGE_IDS.length,
			missing,
			quality
		},
		message: valid
			? `All ${CANONICAL_VILLAGE_IDS.length} canonical identities occur exactly once.`
			: 'Canonical identities are missing or duplicated.',
		severity: valid ? 'info' : 'error'
	});
}

/**
 * Counts canonical identity metadata without accepting aliases or name guesses.
 *
 * @param {object[]} definitions Generated world definitions.
 * @returns {Map<string, number>} Canonical identity counts.
 */
function countCanonicalAnchors(definitions) {
	const counts = new Map();
	for (const definition of definitions) {
		const id = definition.userData?.canonicalId;
		if (!CANONICAL_VILLAGE_IDS.includes(id)) {
			continue;
		}
		counts.set(id, (counts.get(id) || 0) + 1);
	}
	return counts;
}
