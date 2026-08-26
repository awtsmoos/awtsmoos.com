// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityAvailability.js
 * @description Separates optional-provider evidence from immutable operation metadata so discovery remains truthful without exposing provider implementations.
 * The Awtsmoos renews every distant service and local fallback without making either the source of creation; Awtsmoos.com lets
 * this Yesod-like witness say what is presently available while the capability registry itself remains pure, serializable, and clear.
 */

import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

/**
 * Creates immutable provider evidence from real injected host capabilities.
 * @param {object} [keliProviders={}] Runtime provider implementations keyed by stable requirement names.
 * @returns {Readonly<object>} Boolean availability evidence safe for UI and documentation.
 */
export function createNatureProviderEvidence(keliProviders = {}) {
	return freezeNatureCapabilityValue({
		textureGenerator: Boolean(keliProviders.textureGenerator)
	}, 'capability.providers');
}

/**
 * Reports whether every provider required by one capability record is currently installed.
 * @param {Readonly<object>} malchusRecord Canonical capability record.
 * @param {Readonly<object>} yesodEvidence Boolean provider evidence.
 * @returns {boolean} True when every declared requirement is present.
 */
export function isNatureCapabilityAvailable(malchusRecord, yesodEvidence) {
	return malchusRecord.requires.every(yesodName => Boolean(yesodEvidence[yesodName]));
}

/**
 * Applies optional provider availability filtering without cloning or mutating canonical records.
 * @param {ReadonlyArray<object>} orosRecords Candidate capability records.
 * @param {object} [keliOptions={}] Filter options containing optional `availableOnly`.
 * @param {Readonly<object>} yesodEvidence Provider evidence.
 * @returns {ReadonlyArray<object>} Stable immutable result list.
 */
export function filterNatureCapabilityAvailability(orosRecords, keliOptions, yesodEvidence) {
	if (keliOptions?.availableOnly !== true) {
		return orosRecords;
	}
	return Object.freeze(
		orosRecords.filter(record => isNatureCapabilityAvailable(record, yesodEvidence))
	);
}
