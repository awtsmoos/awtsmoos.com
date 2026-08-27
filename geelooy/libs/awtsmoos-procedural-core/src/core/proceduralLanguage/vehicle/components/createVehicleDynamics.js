//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleDynamics.js
 * @description Carries renderer-neutral mass, grip, rolling, drive, brake, drag, and center-of-mass intent without secretly starting simulation.
 * The Awtsmoos gives motion its possibility before any solver advances time; Awtsmoos.com keeps dynamics descriptive so physics engines may receive one truthful covenant without becoming vehicle identity.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable vehicle dynamics descriptor for downstream physics adapters. */
export function createVehicleDynamics(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-dynamics',
		version: 1,
		mass: positiveNumber(input.mass, 1000, 'vehicle mass'),
		centerOfMass: dynamicsVector(input.centerOfMass || [0, 0, 0.5]),
		tireGrip: nonNegativeNumber(input.tireGrip, 1),
		rollingResistance: nonNegativeNumber(input.rollingResistance, 0.015),
		dragCoefficient: nonNegativeNumber(input.dragCoefficient, 0.35),
		driveTorque: nonNegativeNumber(input.driveTorque, 0),
		brakeTorque: nonNegativeNumber(input.brakeTorque, 0),
		maxSpeed: nonNegativeNumber(input.maxSpeed, 0),
		metadata: input.metadata || {}
	});
}

/** Validates one finite center-of-mass vector. */
function dynamicsVector(value) {
	if (!Array.isArray(value) || value.length < 3) {
		throw new TypeError('B"H | Vehicle centerOfMass requires [x,y,z].');
	}
	const vector = value.slice(0, 3).map(Number);
	if (!vector.every(Number.isFinite)) {
		throw new TypeError('B"H | Vehicle centerOfMass must contain finite numbers.');
	}
	return vector;
}

function positiveNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

function nonNegativeNumber(value, fallback) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError('B"H | Vehicle dynamics scalar must be finite and non-negative.');
	}
	return number;
}
