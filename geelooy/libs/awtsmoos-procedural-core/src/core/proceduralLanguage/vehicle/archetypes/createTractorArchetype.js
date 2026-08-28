//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTractorArchetype.js
 * @description Creates an agricultural tractor with unequal wheels, steering, controls, work light, engine cover, hitch, and geared drivetrain whose derived semantics remain coherent under partial overrides.
 * The Awtsmoos turns unequal wheels across one field while Awtsmoos.com lets dimension and subsystem overrides join through deep semantic law instead of shallow replacement concealed.
 */

import { createUtilityRichSystems } from './createUtilityRichSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';
import {
	createUtilityPairedAxle,
	mergeUtilityDimensions
} from './utilityArchetypeSupport.js';

/** Creates one complete tractor source with dimensions resolved before all dependent subsystem positions. */
export function createTractorArchetypeSource(overrides = {}) {
	const dimensions = mergeUtilityDimensions({
		length: 4.1,
		width: 2.05,
		height: 2.55,
		wheelbase: 2.35,
		trackWidth: 1.72,
		groundClearance: 0.42
	}, overrides.dimensions);
	const axles = createTractorAxles(dimensions);
	const propulsion = {
		type: 'combustion',
		drive: 'rear',
		power: 72000
	};
	const source = {
		id: overrides.id || 'tractor',
		archetype: 'tractor',
		dimensions,
		chassis: {
			type: 'ladder',
			frameRadius: 0.055,
			thickness: 0.18
		},
		body: {
			type: 'truck-cab',
			enabled: true
		},
		axles,
		seats: [{
			id: 'driver',
			role: 'driver',
			position: [0, -0.15, 1.25]
		}],
		couplings: [createTractorHitch(dimensions)],
		propulsion,
		dynamics: {
			mass: 3900,
			tireGrip: 1.18,
			rollingResistance: 0.035,
			driveTorque: 4200,
			brakeTorque: 6500
		},
		materials: {
			chassis: 'frame-metal',
			body: 'body-paint',
			seat: 'leather'
		},
		...createUtilityRichSystems('tractor', dimensions, axles, propulsion)
	};
	return mergeVehicleOverrides(source, overrides);
}

/** Creates smaller steering front wheels and large driven rear wheels. */
function createTractorAxles(dimensions) {
	return [
		createUtilityPairedAxle({
			id: 'front',
			y: dimensions.wheelbase / 2,
			dimensions,
			radius: 0.42,
			width: 0.2,
			driven: false,
			steering: {
				type: 'ackermann-intent',
				maxAngleDegrees: 42
			}
		}),
		createUtilityPairedAxle({
			id: 'rear',
			y: -dimensions.wheelbase / 2,
			dimensions,
			radius: 0.68,
			width: 0.38,
			driven: true
		})
	];
}

/** Creates a heavy rear work/towing hitch. */
function createTractorHitch(dimensions) {
	return {
		id: 'rear-hitch',
		couplingType: 'hitch',
		position: [0, -dimensions.length * 0.48, 0.58],
		forward: [0, -1, 0],
		length: 0.2,
		maxLoad: 8000
	};
}
