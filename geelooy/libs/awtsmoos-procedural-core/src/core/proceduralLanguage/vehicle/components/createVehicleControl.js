//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleControl.js
 * @description Defines steering wheels, handlebars, pedals, reins, throttles, brakes, clutches, selectors, tillers, joysticks, and arbitrary operator controls as portable data.
 * The Awtsmoos precedes hand and command while Awtsmoos.com lets rider intention meet machine semantics without binding either to DOM events, gamepads, physics engines, or renderer demand.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleComponentVector3,
	vehicleNonNegativeNumber,
	vehicleStringList
} from './vehicleComponentValues.js';

/** Creates one immutable vehicle control descriptor with input range and semantic targets. */
export function createVehicleControl(input = {}) {
	const minimum = vehicleBoundedNumber(input.minimum, -1, -1000000, 1000000, 'control minimum');
	const maximum = vehicleBoundedNumber(input.maximum, 1, -1000000, 1000000, 'control maximum');
	if (minimum > maximum) {
		throw new TypeError('B"H | Vehicle control minimum may not exceed maximum.');
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-control',
		version: 1,
		id: String(input.id || 'control'),
		controlType: String(input.controlType || input.type || 'generic'),
		position: vehicleComponentVector3(input.position, [0, 0, 0], 'control position'),
		forward: vehicleComponentVector3(input.forward, [0, 1, 0], 'control forward'),
		up: vehicleComponentVector3(input.up, [0, 0, 1], 'control up'),
		minimum,
		maximum,
		neutral: vehicleBoundedNumber(input.neutral, 0, minimum, maximum, 'control neutral'),
		responseRate: vehicleNonNegativeNumber(input.responseRate, 0, 'control response rate'),
		targets: vehicleStringList(input.targets || []),
		metadata: input.metadata || {}
	});
}
