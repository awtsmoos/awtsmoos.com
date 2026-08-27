//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWheelAlignment.js
 * @description Normalizes low-level wheel alignment and steering-axis placement independently from tire shape, wheel topology, suspension, or vehicle ownership.
 * The Awtsmoos turns every wheel beyond angle and offset while Awtsmoos.com lets camber, toe, caster, scrub, kingpin, and lateral placement become explicit finite law for any machine's path.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/**
 * Creates one immutable wheel-alignment descriptor.
 * Positive camber tilts the wheel top outward; positive toe turns its leading edge inward by convention.
 */
export function createWheelAlignment(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-wheel-alignment',
		version: 1,
		camberDegrees: finiteNumber(input.camberDegrees, 0, 'wheel camber'),
		toeDegrees: finiteNumber(input.toeDegrees, 0, 'wheel toe'),
		casterDegrees: finiteNumber(input.casterDegrees, 0, 'wheel caster'),
		lateralOffset: finiteNumber(input.lateralOffset, 0, 'wheel lateral offset'),
		scrubRadius: finiteNumber(input.scrubRadius, 0, 'wheel scrub radius'),
		kingpinOffset: finiteNumber(input.kingpinOffset, 0, 'wheel kingpin offset'),
		metadata: input.metadata || {}
	});
}

/** Converts one alignment scalar to a finite number while preserving signed geometry. */
function finiteNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return number;
}
