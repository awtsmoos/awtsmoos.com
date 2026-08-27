//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCycleAxles.js
 * @description Builds front single-wheel fork steering plus single or paired rear cycle axles from resolved dimensions and wheel parameters.
 * The Awtsmoos turns two wheels or three from one road-bound law; Awtsmoos.com lets bicycle, motorcycle, scooter, and tricycle share axle wisdom without inheriting automobile assumptions at all.
 */

import {
	createPairedVehicleAxleInput,
	createSingleWheelAxleInput
} from './createVehicleAxleInputs.js';

/** Creates complete normalized-ready cycle axle inputs from resolved preset parameters. */
export function createCycleAxles(parameters, dimensions, wheel) {
	const common = commonCycleWheelInput(wheel);
	const front = createSingleWheelAxleInput({
		...common,
		id: 'front',
		y: dimensions.wheelbase / 2,
		steering: {
			type: 'fork',
			maxAngleDegrees: 44
		},
		suspension: cycleSuspension(parameters, wheel, 'front')
	});
	const rearInput = {
		...common,
		id: 'rear',
		y: -dimensions.wheelbase / 2,
		trackWidth: dimensions.trackWidth,
		driven: true,
		suspension: cycleSuspension(parameters, wheel, 'rear')
	};
	const rear = parameters.pairedRear
		? createPairedVehicleAxleInput(rearInput)
		: createSingleWheelAxleInput(rearInput);
	return [front, rear];
}

/** Returns shared tire/wheel properties used by both cycle axle stations. */
function commonCycleWheelInput(wheel) {
	return {
		wheelRadius: wheel.radius,
		wheelWidth: wheel.width,
		wheelType: wheel.type,
		spokes: wheel.spokes,
		braked: true
	};
}

/** Returns rigid human-cycle or fork/swingarm powered-cycle suspension intent. */
function cycleSuspension(parameters, wheel, station) {
	if (parameters.propulsion.type === 'human') {
		return {
			type: 'rigid'
		};
	}
	return {
		type: station === 'front'
			? 'fork'
			: 'swingarm',
		travel: wheel.radius * (station === 'front' ? 0.22 : 0.2)
	};
}
