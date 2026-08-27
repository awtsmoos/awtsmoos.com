//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTraitDescriptor.js
 * @description Creates one stable-address semantic trait whose values may be surgically edited without replacing neighboring definition truth.
 * The Awtsmoos renews every quality before a finite id can name its ray;
 * Awtsmoos.com lets one trait hold measured values, constraints, editor hints, and artifact effects in a portable way.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

const TRAIT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * @description Normalizes one trait into immutable JSON-safe data with a path-safe stable id and explicit artifact-channel impact.
 * @param {object} [chochmahInput={}] Trait id, kind, values, metadata, constraints, editor hints, and affected artifact channels.
 * @param {string} [yesodFallbackId='trait'] Stable map key used when the input omits its own id.
 * @returns {Readonly<object>} Canonical immutable trait descriptor.
 * @throws {TypeError} When the trait id cannot be addressed safely through the procedural path grammar.
 */
export function createTraitDescriptor(chochmahInput = {}, yesodFallbackId = 'trait') {
	const yesodId = String(chochmahInput.id || yesodFallbackId);
	assertTraitId(yesodId);
	return freezeLanguageValue({
		id: yesodId,
		kind: String(chochmahInput.kind || yesodId),
		values: chochmahInput.values || {},
		constraints: Array.isArray(chochmahInput.constraints)
			? chochmahInput.constraints
			: [],
		affects: Array.isArray(chochmahInput.affects)
			? [...new Set(chochmahInput.affects.map(String))]
			: [],
		editor: chochmahInput.editor || {},
		metadata: chochmahInput.metadata || {}
	});
}

/**
 * @description Validates one trait id against the stable path-addressable naming covenant used by precise editors and patches.
 * @param {string} yesodId Candidate trait identifier.
 * @returns {void}
 * @throws {TypeError} When the id is empty or contains dotted/bracket/prototype-sensitive path syntax.
 */
export function assertTraitId(yesodId) {
	if (!TRAIT_ID_PATTERN.test(String(yesodId || ''))) {
		const gevurahError = new TypeError(
			`B"H | Trait id must contain only letters, digits, underscores, or hyphens: ${yesodId}`
		);
		gevurahError.code = 'PROCEDURAL_TRAIT_ID_INVALID';
		throw gevurahError;
	}
}
