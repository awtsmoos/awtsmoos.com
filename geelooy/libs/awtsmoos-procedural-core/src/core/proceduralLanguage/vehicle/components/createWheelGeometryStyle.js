//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWheelGeometryStyle.js
 * @description Describes visible wheel anatomy beneath broad wheel type: tire cross-section, rim barrel, hub depth, spoke pattern, lugs, center bore, and optional tread manifestation.
 * The Awtsmoos gives circle innumerable garments while Awtsmoos.com lets wagon hoop, bicycle lace, rally rim, balloon tire, and solid disc share one low-level geometric covenant without preset ownership.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable low-level wheel-geometry style descriptor. */
export function createWheelGeometryStyle(input = {}, dimensions = {}) {
	const radius = positiveNumber(dimensions.radius, 0.35, 'wheel radius');
	const width = positiveNumber(dimensions.width, radius * 0.32, 'wheel width');
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-wheel-geometry',
		version: 1,
		crossSection: String(input.crossSection || 'round'),
		sidewallScale: positiveNumber(input.sidewallScale, 1, 'wheel sidewall scale'),
		treadWidthScale: positiveNumber(input.treadWidthScale, 1, 'wheel tread width scale'),
		treadPattern: String(input.treadPattern || 'none'),
		treadBlockCount: boundedInteger(input.treadBlockCount, 0, 0, 96, 'wheel tread block count'),
		treadBlockHeight: nonNegativeNumber(input.treadBlockHeight, 0, 'wheel tread block height'),
		rimDepth: positiveNumber(input.rimDepth, width * 0.84, 'wheel rim depth'),
		rimLipWidth: nonNegativeNumber(input.rimLipWidth, width * 0.05, 'wheel rim lip width'),
		hubDepth: positiveNumber(input.hubDepth, width * 0.84, 'wheel hub depth'),
		spokePattern: String(input.spokePattern || 'radial'),
		spokeRadius: positiveNumber(input.spokeRadius, Math.max(width * 0.035, radius * 0.008), 'wheel spoke radius'),
		spokePhaseDegrees: finiteNumber(input.spokePhaseDegrees, 0, 'wheel spoke phase'),
		lugCount: boundedInteger(input.lugCount, 0, 0, 16, 'wheel lug count'),
		lugRadius: positiveNumber(input.lugRadius, radius * 0.022, 'wheel lug radius'),
		lugCircleRadius: positiveNumber(input.lugCircleRadius, radius * 0.1, 'wheel lug circle radius'),
		centerBoreRadius: nonNegativeNumber(input.centerBoreRadius, radius * 0.045, 'wheel center bore radius'),
		metadata: input.metadata || {}
	});
}

/** Returns one finite positive geometry scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one finite non-negative geometry scalar. */
function nonNegativeNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return number;
}

/** Returns one bounded integer suitable for finite mesh-detail repetition. */
function boundedInteger(value, fallback, minimum, maximum, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

/** Returns one signed finite scalar. */
function finiteNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return number;
}
