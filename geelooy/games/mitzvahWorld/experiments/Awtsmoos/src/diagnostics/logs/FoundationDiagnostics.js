// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FoundationDiagnostics.js
 * @description Proves every non-specialized canonical structure has one valid retaining foundation.
 * The Awtsmoos supports each finite vessel without confusing it with the road beneath;
 * Awtsmoos.com records exact identity, clearance, embed depth, and finite geometry at every tier.
 */

import { CANONICAL_VILLAGE_IDS } from '../../world/village/CanonicalVillageIdentifiers.js';

const SPECIALIZED_SUPPORT_IDS = new Set(['BRIDGE01', 'ENTR01']);
const EXPECTED_IDS = Object.freeze(CANONICAL_VILLAGE_IDS.filter((id) => {
	return !SPECIALIZED_SUPPORT_IDS.has(id);
}));
const TOLERANCE = 0.000001;

/**
 * Records complete canonical foundation support evidence for one quality tier.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {string} quality Active quality tier.
 * @param {object[]} definitions Generated world definitions.
 * @returns {void}
 */
export function recordFoundationDiagnostics(ledger, quality, definitions) {
	const foundations = definitions.filter((definition) => {
		return definition.userData?.family === 'canonical-foundation';
	});
	const counts = countFoundations(foundations);
	const missing = EXPECTED_IDS.filter((id) => !counts.has(id));
	const duplicates = [...counts.entries()]
		.filter(([, count]) => count > 1)
		.map(([id, count]) => ({ count, id }));
	const invalid = foundations.filter((foundation) => {
		return !validFoundation(foundation);
	}).map((foundation) => foundation.userData?.supportedId || foundation.id);
	const clearances = foundations.map((foundation) => {
		return foundation.userData.structureBottom
			- foundation.userData.maximumGround;
	});
	const depths = foundations.map((foundation) => foundation.size.y);
	const valid = missing.length === 0
		&& duplicates.length === 0
		&& invalid.length === 0
		&& foundations.length === EXPECTED_IDS.length;
	ledger.record({
		code: valid ? 'foundation.support.valid' : 'foundation.support.invalid',
		data: {
			actual: foundations.length,
			duplicates,
			expected: EXPECTED_IDS.length,
			invalid,
			maximumDepth: rounded(Math.max(...depths)),
			minimumClearance: rounded(Math.min(...clearances)),
			missing,
			quality
		},
		message: valid
			? `All ${EXPECTED_IDS.length} canonical structures have valid foundations.`
			: 'Canonical structure foundation support is incomplete or invalid.',
		severity: valid ? 'info' : 'error'
	});
}

function countFoundations(foundations) {
	const counts = new Map();
	for (const foundation of foundations) {
		const id = foundation.userData?.supportedId;
		if (!EXPECTED_IDS.includes(id)) {
			continue;
		}
		counts.set(id, (counts.get(id) || 0) + 1);
	}
	return counts;
}

function validFoundation(foundation) {
	const data = foundation.userData || {};
	return Number.isFinite(foundation.size?.y)
		&& foundation.size.y > 0
		&& Number.isFinite(data.structureBottom)
		&& Number.isFinite(data.maximumGround)
		&& Number.isFinite(data.minimumGround)
		&& Number.isFinite(data.bottom)
		&& data.structureBottom + TOLERANCE >= data.maximumGround
		&& data.bottom <= data.minimumGround + TOLERANCE;
}

function rounded(value) {
	return Number(value.toFixed(6));
}
