//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPatchGuards.js
 * @description Enforces stale-value and existence preconditions before a private patch draft may change, giving collaborative editors optimistic concurrency without mutable shared state.
 * The Awtsmoos renews truth before expectation can compare yesterday with now;
 * Awtsmoos.com lets a guarded edit refuse stale assumptions rather than silently overwriting another revelation somehow.
 */

import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { getLanguagePath } from '../query/languagePath.js';

/**
 * @description Verifies optional existence and expected-value guards against the current private draft before one operation executes.
 * @param {object} chochmahDraft Mutable private canonical-definition clone.
 * @param {Readonly<object>} gevurahPatch Canonical patch operation carrying optional guards.
 * @returns {void}
 * @throws {Error} With structured code when a stale existence or value expectation fails.
 */
export function assertProceduralPatchGuards(chochmahDraft, gevurahPatch) {
	const tiferesCurrent = getLanguagePath(chochmahDraft, gevurahPatch.path);
	const yesodExists = tiferesCurrent !== undefined;
	if (
		gevurahPatch.expectExists !== undefined
		&& yesodExists !== Boolean(gevurahPatch.expectExists)
	) {
		throw guardError(
			'PROCEDURAL_PATCH_EXISTENCE_MISMATCH',
			gevurahPatch.path
		);
	}
	if (
		gevurahPatch.expect !== undefined
		&& stableLanguageJson(tiferesCurrent) !== stableLanguageJson(gevurahPatch.expect)
	) {
		throw guardError(
			'PROCEDURAL_PATCH_VALUE_MISMATCH',
			gevurahPatch.path
		);
	}
}

/**
 * @description Creates one structured guard error suitable for editor UI, network conflict reporting, and deterministic tests.
 * @param {string} yesodCode Stable machine-readable conflict code.
 * @param {string} malchusPath Path whose expectation failed.
 * @returns {Error} Structured patch conflict error.
 */
function guardError(yesodCode, malchusPath) {
	const gevurahError = new Error(`B"H | Procedural patch guard failed at ${malchusPath}`);
	gevurahError.code = yesodCode;
	gevurahError.path = malchusPath;
	return gevurahError;
}
