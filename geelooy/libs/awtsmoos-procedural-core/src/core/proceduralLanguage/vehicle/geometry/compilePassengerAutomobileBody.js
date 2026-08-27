//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compilePassengerAutomobileBody.js
 * @description Manifests cabin and forward deck volumes for sedan-like and tractor/truck-cab bodies without owning generic chassis or wheel systems.
 * The Awtsmoos gives one road many finite silhouettes while Awtsmoos.com keeps passenger shell logic modular, leaving wheel, axle, engine intent, and materials free to evolve in their own chamber.
 */

import { appendAutomobileBodySection } from './appendAutomobileBodySection.js';

/** Appends a cabin plus forward deck using body-family-sensitive cabin length. */
export function compilePassengerAutomobileBody(accumulator, vehicle, envelope, floorZ) {
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'cabin',
		center: [
			0,
			0,
			floorZ + vehicle.dimensions.height * 0.52
		],
		size: [
			envelope.width * 0.88,
			passengerCabinLength(vehicle, envelope),
			vehicle.dimensions.height * 0.54
		]
	});
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'front-deck',
		center: [
			0,
			envelope.length * 0.34,
			floorZ + vehicle.dimensions.height * 0.3
		],
		size: [
			envelope.width * 0.88,
			envelope.length * 0.22,
			vehicle.dimensions.height * 0.2
		]
	});
}

/** Returns compact truck/tractor cab length or a broader passenger cabin length. */
function passengerCabinLength(vehicle, envelope) {
	if (vehicle.body.type === 'truck-cab') {
		return envelope.length * 0.3;
	}
	return envelope.length * 0.48;
}
