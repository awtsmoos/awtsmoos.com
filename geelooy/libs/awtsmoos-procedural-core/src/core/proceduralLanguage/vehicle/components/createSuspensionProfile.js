//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSuspensionProfile.js
 * @description Normalizes detailed suspension intent for rigid axles, springs, dampers, forks, swingarms, bogies, leaf systems, independent corners, and future mechanisms.
 * The Awtsmoos bears every load beyond compression or rebound while Awtsmoos.com lets travel, spring rate, preload, damping, anti-roll, stops, ride height, and axis become portable finite sound.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable suspension profile while retaining legacy spring/damping fields. */
export function createSuspensionProfile(input = {}) {
	const springRate = nonNegativeNumber(
		input.springRate ?? input.spring,
		0,
		'suspension spring rate'
	);
	const compressionDamping = nonNegativeNumber(
		input.compressionDamping ?? input.damping,
		0,
		'suspension compression damping'
	);
	const reboundDamping = nonNegativeNumber(
		input.reboundDamping ?? input.damping,
		compressionDamping,
		'suspension rebound damping'
	);
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-suspension-profile',
		version: 1,
		type: String(input.type || 'rigid'),
		travel: nonNegativeNumber(input.travel, 0, 'suspension travel'),
		spring: springRate,
		damping: compressionDamping,
		springRate,
		preload: nonNegativeNumber(input.preload, 0, 'suspension preload'),
		compressionDamping,
		reboundDamping,
		antiRollRate: nonNegativeNumber(input.antiRollRate, 0, 'suspension anti-roll rate'),
		rideHeight: finiteNumber(input.rideHeight, 0, 'suspension ride height'),
		bumpStop: nonNegativeNumber(input.bumpStop, 0, 'suspension bump stop'),
		droopStop: nonNegativeNumber(input.droopStop, 0, 'suspension droop stop'),
		axis: vector3(input.axis || [0, 0, 1], 'suspension axis'),
		independent: Boolean(input.independent),
		metadata: input.metadata || {}
	});
}

/** Returns one finite non-negative suspension scalar. */
function nonNegativeNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return number;
}

/** Returns one signed finite suspension scalar. */
function finiteNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return number;
}

/** Validates one finite suspension XYZ vector. */
function vector3(value, label) {
	const vector = Array.isArray(value) ? value.slice(0, 3).map(Number) : [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
