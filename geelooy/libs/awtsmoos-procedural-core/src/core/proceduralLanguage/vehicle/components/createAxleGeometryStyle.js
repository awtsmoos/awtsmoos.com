//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAxleGeometryStyle.js
 * @description Describes visible axle shaft, material, tessellation, and optional differential housing independently from steering, suspension, drive, or wheel membership.
 * The Awtsmoos joins wheel to wheel beyond shaft and housing while Awtsmoos.com lets one axle appear as bicycle spindle, chariot beam, truck tube, or differential-bearing machine through explicit finite clothing.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable renderer-neutral axle-geometry style descriptor. */
export function createAxleGeometryStyle(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-axle-geometry',
		version: 1,
		shaftVisible: input.shaftVisible !== false,
		shaftRadius: positiveNumber(input.shaftRadius, 0.035, 'axle shaft radius'),
		shaftSegments: boundedInteger(input.shaftSegments, 10, 4, 64, 'axle shaft segments'),
		materialRole: String(input.materialRole || 'frame-metal'),
		differentialVisible: Boolean(input.differentialVisible),
		differentialType: String(input.differentialType || 'none'),
		differentialRadius: positiveNumber(
			input.differentialRadius,
			0.12,
			'axle differential radius'
		),
		metadata: input.metadata || {}
	});
}

/** Returns one finite positive axle-geometry scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one bounded integer for deterministic axle tessellation. */
function boundedInteger(value, fallback, minimum, maximum, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}
