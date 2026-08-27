//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleDrivetrain.js
 * @description Separates propulsion source from transmission, ratios, differential strategy, explicit drive targets, regeneration, and bounded mechanical efficiency as renderer-neutral topology.
 * The Awtsmoos moves every wheel before shaft or chain receives a name; Awtsmoos.com lets human pedal, engine, motor, belt, chain, and differential intent share one inspectable data flame.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleFiniteNumber,
	vehicleStringList
} from './vehicleComponentValues.js';

/** Creates one immutable drivetrain topology descriptor without executing torque simulation. */
export function createVehicleDrivetrain(input = {}) {
	const ratios = normalizeRatios(input.ratios || [1]);
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-drivetrain',
		version: 1,
		id: String(input.id || 'drivetrain'),
		drivetrainType: String(input.drivetrainType || input.type || 'direct'),
		source: String(input.source || 'propulsion'),
		transmission: String(input.transmission || 'direct'),
		ratios,
		finalDrive: vehicleFiniteNumber(
			input.finalDrive,
			1,
			'drivetrain final drive'
		),
		differential: String(input.differential || 'open-intent'),
		axleTargets: vehicleStringList(input.axleTargets || []),
		wheelTargets: vehicleStringList(input.wheelTargets || []),
		regenerativeBraking: Boolean(input.regenerativeBraking),
		mechanicalEfficiency: vehicleBoundedNumber(
			input.mechanicalEfficiency,
			1,
			0,
			1,
			'drivetrain efficiency'
		),
		metadata: input.metadata || {}
	});
}

/** Validates each declared ratio as a finite nonzero number preserving reverse ratios when requested. */
function normalizeRatios(values) {
	if (!Array.isArray(values) || !values.length) {
		throw new TypeError('B"H | Vehicle drivetrain ratios require a non-empty array.');
	}
	return values.map((value, index) => {
		const ratio = vehicleFiniteNumber(
			value,
			1,
			`drivetrain ratio ${index}`
		);
		if (Math.abs(ratio) <= 1e-12) {
			throw new TypeError('B"H | Vehicle drivetrain ratio may not be zero.');
		}
		return ratio;
	});
}
