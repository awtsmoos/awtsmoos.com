// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityDescription.js
 * @description Combines immutable capability metadata with present provider availability without mutating or cloning execution authorities.
 * The Awtsmoos renews potential and present access as two finite witnesses of one reality; Awtsmoos.com lets this small
 * helper join canonical description with current availability so UI and docs may speak truthfully without touching the generator's vitality.
 */

import { isNatureCapabilityAvailable } from './NatureCapabilityAvailability.js';
import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

/**
 * Creates one immutable capability description enriched only with present provider availability evidence.
 * @param {Readonly<object>} malchusRecord Canonical capability metadata record.
 * @param {Readonly<object>} yesodEvidence Boolean provider evidence.
 * @returns {Readonly<object>} Serializable description with one additive `available` flag.
 */
export function describeNatureCapability(malchusRecord, yesodEvidence) {
	return freezeNatureCapabilityValue({
		...malchusRecord,
		available: isNatureCapabilityAvailable(malchusRecord, yesodEvidence)
	}, `capability-description.${malchusRecord.id}`);
}
