//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileAxles.js
 * @description Builds dimension-derived steering, driven, suspended, and optional third automobile axles without mixing body, occupancy, or rich-feature policy into wheel placement.
 * The Awtsmoos joins track and wheelbase before road receives form; Awtsmoos.com lets axle geometry follow resolved dimensions so width and length overrides never leave hidden wheels behind the storm.
 */

import { createPairedVehicleAxleInput } from './createVehicleAxleInputs.js';

/** Creates front/rear and optional middle axle inputs from resolved automobile parameters. */
export function createAutomobileAxles(id, dimensions, wheel, threeAxles = false) {
	const frontY = dimensions.wheelbase / 2;
	const rearY = -dimensions.wheelbase / 2;
	const axles = [createFrontAxle(id, dimensions, wheel, frontY)];
	if (threeAxles) {
		axles.push(createMiddleAxle(dimensions, wheel, rearY));
	}
	axles.push(createRearAxle(id, dimensions, wheel, rearY));
	return axles;
}

/** Creates the steerable front automobile axle. */
function createFrontAxle(id, dimensions, wheel, y) {
	return createPairedVehicleAxleInput({
		id: 'front',
		y,
		trackWidth: dimensions.trackWidth,
		wheelRadius: wheel.radius,
		wheelWidth: wheel.width,
		steering: {
			type: 'ackermann-intent',
			maxAngleDegrees: id === 'bus' ? 32 : 36
		},
		suspension: {
			type: 'spring-damper',
			travel: wheel.radius * 0.28
		},
		driven: id === 'car' || id === 'van',
		braked: true
	});
}

/** Creates one driven heavy middle axle for multi-axle truck presets. */
function createMiddleAxle(dimensions, wheel, rearY) {
	return createPairedVehicleAxleInput({
		id: 'middle',
		y: rearY + dimensions.wheelbase * 0.22,
		trackWidth: dimensions.trackWidth,
		wheelRadius: wheel.radius,
		wheelWidth: wheel.width,
		suspension: {
			type: 'leaf-intent',
			travel: wheel.radius * 0.18
		},
		driven: true,
		braked: true
	});
}

/** Creates the rear load-bearing axle with family-sensitive drive and suspension intent. */
function createRearAxle(id, dimensions, wheel, y) {
	return createPairedVehicleAxleInput({
		id: 'rear',
		y,
		trackWidth: dimensions.trackWidth,
		wheelRadius: wheel.radius,
		wheelWidth: wheel.width,
		suspension: {
			type: id === 'truck'
				? 'leaf-intent'
				: 'spring-damper',
			travel: wheel.radius * 0.24
		},
		driven: id !== 'car' && id !== 'van',
		braked: true
	});
}
