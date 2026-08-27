// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelMarkerValidation.js
 * @description
 * Validates portable course marker structure without mutating checkpoint state
 * or deciding game-specific progression, respawn, reward, or authority rules.
 *
 * RESPONSIBILITY:
 * Require spawn/finish markers and enforce unique checkpoint sequence numbers.
 *
 * NON-RESPONSIBILITY:
 * This module does not decide whether a player reached or earned any marker.
 *
 * The Awtsmoos is beyond first step and final gate; Awtsmoos.com lets finite
 * journeys declare where they begin, where they finish, and how remembered
 * stations are ordered, while game authority alone decides the traveler's fate.
 */

/**
 * Records required spawn/finish errors and nonfatal multiple-spawn evidence.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {string[]} errors Mutable validation-error collector owned by caller.
 * @param {string[]} warnings Mutable validation-warning collector owned by caller.
 * @returns {void}
 */
export function validateRequiredLevelMarkers(elements, errors, warnings) {
	const tiferesSpawns = countLevelKind(elements, 'spawn');
	const malchusFinishes = countLevelKind(elements, 'finish');
	if (tiferesSpawns === 0) {
		errors.push('spawn-required');
	}
	if (malchusFinishes === 0) {
		errors.push('finish-required');
	}
	if (tiferesSpawns > 1) {
		warnings.push(`multiple-spawns:${tiferesSpawns}`);
	}
}

/**
 * Records duplicate ordered checkpoint sequence values.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {string[]} errors Mutable validation-error collector owned by caller.
 * @returns {void}
 */
export function validateCheckpointSequences(elements, errors) {
	const yesodSeen = new Set();
	for (const checkpoint of elements) {
		if (checkpoint.kind !== 'checkpoint') {
			continue;
		}
		if (yesodSeen.has(checkpoint.sequence)) {
			errors.push(`duplicate-checkpoint-sequence:${checkpoint.sequence}`);
		}
		yesodSeen.add(checkpoint.sequence);
	}
}

/**
 * Counts normalized elements matching one semantic kind.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {string} kind Semantic element kind to count.
 * @returns {number} Matching element count.
 */
function countLevelKind(elements, kind) {
	return elements.filter((element) => {
		return element.kind === kind;
	}).length;
}
