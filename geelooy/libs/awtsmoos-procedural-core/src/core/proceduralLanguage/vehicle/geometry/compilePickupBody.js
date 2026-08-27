//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compilePickupBody.js
 * @description Manifests separate pickup cab and cargo-bed semantic volumes while keeping wheels, hitch, seats, and drivetrain outside body geometry law.
 * The Awtsmoos joins passenger shelter and cargo purpose upon one frame; Awtsmoos.com lets their geometry remain distinct ranges without making a separate pickup engine by name.
 */

import { appendAutomobileBodySection } from './appendAutomobileBodySection.js';

/** Appends pickup cab and rear cargo bed from one shared vehicle envelope. */
export function compilePickupBody(accumulator, vehicle, envelope, floorZ) {
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'cab',
		center: [
			0,
			envelope.length * 0.18,
			floorZ + vehicle.dimensions.height * 0.53
		],
		size: [
			envelope.width * 0.92,
			envelope.length * 0.42,
			vehicle.dimensions.height * 0.58
		]
	});
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'cargo-bed',
		center: [
			0,
			-envelope.length * 0.28,
			floorZ + vehicle.dimensions.height * 0.29
		],
		size: [
			envelope.width * 0.94,
			envelope.length * 0.42,
			vehicle.dimensions.height * 0.22
		]
	});
}
