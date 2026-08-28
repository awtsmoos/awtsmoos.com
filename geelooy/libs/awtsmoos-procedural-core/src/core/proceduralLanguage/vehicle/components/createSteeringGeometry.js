//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSteeringGeometry.js
 * @description Normalizes detailed renderer-neutral steering geometry and linkage intent for front steer, rear steer, crab, articulated, fork, Ackermann, differential, or custom systems.
 * The Awtsmoos guides every turning path without being left or right; Awtsmoos.com lets steering ratio, Ackermann proportion, rear-steer gain, linkage, and pivot axis remain explicit portable light.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable steering-geometry descriptor while retaining legacy `type` and `maxAngleDegrees`. */
export function createSteeringGeometry(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-steering-geometry',
		version: 1,
		type: String(input.type || 'none'),
		maxAngleDegrees: nonNegativeNumber(
			input.maxAngleDegrees,
			0,
			'steering max angle'
		),
		steeringRatio: positiveNumber(input.steeringRatio, 1, 'steering ratio'),
		ackermannFactor: boundedNumber(input.ackermannFactor, 1, 0, 2, 'Ackermann factor'),
		rearSteerFactor: boundedNumber(input.rearSteerFactor, 0, -1, 1, 'rear steer factor'),
		linkageType: String(input.linkageType || input.type || 'none'),
		pivotAxis: vector3(input.pivotAxis || [0, 0, 1], 'steering pivot axis'),
		pivotOffset: vector3(input.pivotOffset || [0, 0, 0], 'steering pivot offset'),
		metadata: input.metadata || {}
	});
}

/** Returns one finite positive steering scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one finite non-negative steering scalar. */
function nonNegativeNumber(value, fallback, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`B"H | ${label} must be finite and non-negative.`);
	}
	return number;
}

/** Returns one bounded steering scalar, rejecting values that would obscure authored intent. */
function boundedNumber(value, fallback, minimum, maximum, label) {
	const number = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw new TypeError(`B"H | ${label} must be between ${minimum} and ${maximum}.`);
	}
	return number;
}

/** Validates one finite steering XYZ vector. */
function vector3(value, label) {
	const vector = Array.isArray(value)
		? value.slice(0, 3).map(Number)
		: [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
