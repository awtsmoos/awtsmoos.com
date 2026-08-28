//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralPatchOperation.js
 * @description Normalizes precise immutable patch intent before mutation so editors, transactions, layers, networks, and AI all speak one guarded operation covenant.
 * The Awtsmoos renews change before set, merge, scale, increment, toggle, append, remove, or rename can claim the deed;
 * Awtsmoos.com lets Gevurah validate path and intent first so one surgical edit never becomes uncontrolled need.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { parseLanguagePath } from '../query/languagePath.js';

export const PROCEDURAL_PATCH_OPERATIONS = Object.freeze([
	'set',
	'merge',
	'append',
	'remove',
	'increment',
	'scale',
	'toggle',
	'rename'
]);

/**
 * @description Creates one path-validated JSON-safe patch operation while preserving optional stale-value guards and authoring reason metadata.
 * @param {object} chochmahInput Patch op, path, value/factor/delta/to, guards, id, reason, and metadata.
 * @param {number} [malchusIndex=0] Deterministic fallback operation index.
 * @returns {Readonly<object>} Canonical portable patch operation.
 * @throws {TypeError|RangeError} When operation or path is unsupported.
 */
export function createProceduralPatchOperation(chochmahInput = {}, malchusIndex = 0) {
	const yesodOp = String(chochmahInput.op || '');
	if (!PROCEDURAL_PATCH_OPERATIONS.includes(yesodOp)) {
		throw new RangeError(`B"H | Unsupported procedural patch op: ${yesodOp}`);
	}
	const binahSegments = parseLanguagePath(chochmahInput.path);
	if (!binahSegments.length) {
		throw new TypeError('B"H | Procedural patch requires a non-root path.');
	}
	return freezeLanguageValue({
		id: String(chochmahInput.id || `patch-${malchusIndex}`),
		op: yesodOp,
		path: binahSegments.join('.'),
		value: chochmahInput.value,
		delta: chochmahInput.delta,
		factor: chochmahInput.factor,
		to: chochmahInput.to,
		expect: chochmahInput.expect,
		expectExists: chochmahInput.expectExists,
		reason: chochmahInput.reason ? String(chochmahInput.reason) : '',
		metadata: chochmahInput.metadata || {}
	});
}
