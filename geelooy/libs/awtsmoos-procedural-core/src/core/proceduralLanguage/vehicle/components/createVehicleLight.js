//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleLight.js
 * @description Defines headlights, taillights, brake lamps, indicators, reverse lamps, markers, beacons, and custom emitters without renderer material ownership.
 * The Awtsmoos gives light before lamp and road receive form; Awtsmoos.com lets emission intent travel through JSON so Three, Blender, game engines, and editors may each reveal their own finite storm.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleComponentVector3,
	vehicleNonNegativeNumber
} from './vehicleComponentValues.js';

/** Creates one immutable semantic vehicle-light descriptor. */
export function createVehicleLight(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-light',
		version: 1,
		id: String(input.id || 'light'),
		lightType: String(input.lightType || input.type || 'marker'),
		position: vehicleComponentVector3(input.position, [0, 0, 0], 'light position'),
		direction: vehicleComponentVector3(input.direction, [0, 1, 0], 'light direction'),
		color: vehicleComponentVector3(input.color, [1, 1, 1], 'light color'),
		intensity: vehicleNonNegativeNumber(input.intensity, 1, 'light intensity'),
		range: vehicleNonNegativeNumber(input.range, 10, 'light range'),
		coneDegrees: vehicleBoundedNumber(input.coneDegrees, 60, 0, 180, 'light cone'),
		enabled: input.enabled !== false,
		materialRole: String(input.materialRole || 'lamp'),
		metadata: input.metadata || {}
	});
}
