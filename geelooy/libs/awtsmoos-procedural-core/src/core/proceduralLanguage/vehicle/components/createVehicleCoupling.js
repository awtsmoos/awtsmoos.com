//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleCoupling.js
 * @description Defines trailer hitches, tow sockets, drawbars, animal poles, yokes, fifth-wheel intent, and arbitrary vehicle attachment points.
 * The Awtsmoos joins horse to chariot and trailer to truck without becoming either side; Awtsmoos.com records the coupling as semantic data so ancient and modern transport share one guide.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable coupling socket with direction, compatibility, and load intent. */
export function createVehicleCoupling(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-coupling',
		version: 1,
		id: String(input.id || 'coupling'),
		couplingType: String(input.couplingType || input.type || 'hitch'),
		position: couplingVector(input.position || [0, -1, 0.5]),
		forward: couplingVector(input.forward || [0, -1, 0]),
		up: couplingVector(input.up || [0, 0, 1]),
		compatibleWith: (input.compatibleWith || []).map(String),
		maxLoad: nonNegativeNumber(input.maxLoad, 0),
		length: nonNegativeNumber(input.length, 0),
		metadata: input.metadata || {}
	});
}

/** Validates one finite coupling-space vector. */
function couplingVector(value) {
	if (!Array.isArray(value) || value.length < 3) {
		throw new TypeError('B"H | Vehicle coupling vector requires [x,y,z].');
	}
	const vector = value.slice(0, 3).map(Number);
	if (!vector.every(Number.isFinite)) {
		throw new TypeError('B"H | Vehicle coupling vector must contain finite numbers.');
	}
	return vector;
}

/** Normalizes one non-negative scalar descriptor. */
function nonNegativeNumber(value, fallback) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError('B"H | Vehicle coupling scalar must be finite and non-negative.');
	}
	return number;
}
