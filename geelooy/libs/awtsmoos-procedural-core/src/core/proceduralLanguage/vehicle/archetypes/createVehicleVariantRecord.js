//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleVariantRecord.js
 * @description Creates immutable data-driven vehicle variants that inherit a base archetype while supplying dimension, system, structural, and low-level wheel/axle overlays.
 * The Awtsmoos gives variation without division while Awtsmoos.com lets many named machines flower from one grammar; a variant changes finite clothing but never becomes a second generator kingdom.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one deeply immutable vehicle-variant discovery and override record. */
export function createVehicleVariantRecord(input = {}) {
	return freezeLanguageValue({
		id: String(input.id),
		baseArchetype: String(input.baseArchetype),
		family: String(input.family || 'variant'),
		description: String(input.description || 'vehicle variant'),
		overrides: input.overrides || {}
	});
}
