//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileAutomobileBodyGeometry.js
 * @description Coordinates lower body and family-specific automobile shell sections while delegating each silhouette responsibility to a smaller geometry module.
 * The Awtsmoos clothes chassis without becoming its garment; Awtsmoos.com keeps this body coordinator light so van, bus, pickup, trailer, sedan, and truck forms can evolve without swallowing the wheel road.
 */

import { appendAutomobileBodySection } from './appendAutomobileBodySection.js';
import { compilePassengerAutomobileBody } from './compilePassengerAutomobileBody.js';
import { compilePickupBody } from './compilePickupBody.js';
import { compileTallAutomobileBody } from './compileTallAutomobileBody.js';
import {
	vehicleFloorCenterZ,
	vehicleInnerEnvelope
} from './vehicleGeometryLayout.js';

/** Compiles enabled body envelope sections for generic road/utility vehicle structural grammars. */
export function compileAutomobileBodyGeometry(accumulator, vehicle) {
	if (!vehicle.body.enabled) {
		return;
	}
	const floorZ = vehicleFloorCenterZ(vehicle);
	const envelope = vehicleInnerEnvelope(vehicle);
	appendLowerBody(accumulator, vehicle, envelope, floorZ);
	if (isTallBody(vehicle.body.type)) {
		compileTallAutomobileBody(accumulator, vehicle, envelope, floorZ);
		return;
	}
	if (vehicle.body.type === 'pickup') {
		compilePickupBody(accumulator, vehicle, envelope, floorZ);
		return;
	}
	compilePassengerAutomobileBody(accumulator, vehicle, envelope, floorZ);
}

/** Appends the common lower body volume above the chassis. */
function appendLowerBody(accumulator, vehicle, envelope, floorZ) {
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'lower-body',
		center: [
			0,
			0,
			floorZ + vehicle.dimensions.height * 0.18
		],
		size: [
			envelope.width,
			envelope.length,
			vehicle.dimensions.height * 0.28
		]
	});
}

/** Identifies body families using one large enclosed upper volume. */
function isTallBody(bodyType) {
	return ['van', 'bus', 'trailer-box'].includes(bodyType);
}
