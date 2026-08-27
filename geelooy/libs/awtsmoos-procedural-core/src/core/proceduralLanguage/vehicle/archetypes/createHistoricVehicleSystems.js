//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createHistoricVehicleSystems.js
 * @description Builds wood-spoke axle layouts, occupant semantics, and forward yoke/handle couplings for ancient and human-powered open vehicles.
 * The Awtsmoos carried traveler and burden before engines were named; Awtsmoos.com lets wheelbarrow, chariot, wagon, carriage, and handcart share structural wisdom while each keeps its historic flame.
 */

import {
	createPairedVehicleAxleInput,
	createSingleWheelAxleInput
} from './createVehicleAxleInputs.js';

/** Creates single-wheel, one-axle, or paired two-axle historic wheel systems from resolved parameters. */
export function createHistoricAxles(parameters, dimensions) {
	const wheel = parameters.wheel;
	if (parameters.singleFrontWheel) {
		return [createSingleWheelAxleInput({
			id: 'front',
			y: dimensions.wheelbase / 2,
			wheelRadius: wheel.radius,
			wheelWidth: wheel.width,
			wheelType: 'solid',
			spokes: wheel.spokes,
			steering: {
				type: 'fixed',
				maxAngleDegrees: 0
			},
			braked: false
		})];
	}
	if (parameters.axles === 1) {
		return [historicPairedAxle(
			'main',
			-dimensions.wheelbase * 0.12,
			dimensions,
			wheel
		)];
	}
	return [
		historicPairedAxle('front', dimensions.wheelbase / 2, dimensions, wheel),
		historicPairedAxle('rear', -dimensions.wheelbase / 2, dimensions, wheel)
	];
}

/** Creates occupancy semantics appropriate to standing, bench, or cargo-only vehicles. */
export function createHistoricSeats(parameters, dimensions) {
	if (parameters.occupancy === 'none') {
		return [];
	}
	return [{
		id: 'occupants',
		role: 'rider',
		seatType: parameters.occupancy,
		capacity: parameters.occupancy === 'bench'
			? 2
			: 1,
		position: [
			0,
			-dimensions.length * 0.08,
			dimensions.height * 0.55
		]
	}];
}

/** Creates a forward animal yoke or human push/pull handle coupling. */
export function createHistoricCouplings(parameters, dimensions) {
	const animal = parameters.propulsion === 'animal';
	return [{
		id: animal
			? 'animal-yoke'
			: 'human-handles',
		couplingType: animal
			? 'yoke'
			: 'handle',
		position: [
			0,
			dimensions.length * 0.72,
			dimensions.groundClearance + 0.38
		],
		forward: [0, 1, 0],
		length: dimensions.length * 0.35,
		maxLoad: parameters.mass * 4
	}];
}

/** Creates one paired rigid wood-spoke axle. */
function historicPairedAxle(id, y, dimensions, wheel) {
	return createPairedVehicleAxleInput({
		id,
		y,
		trackWidth: dimensions.trackWidth,
		wheelRadius: wheel.radius,
		wheelWidth: wheel.width,
		wheelType: 'wood-spoke',
		spokes: wheel.spokes,
		braked: false,
		suspension: {
			type: 'rigid'
		}
	});
}
