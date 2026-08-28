//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileTallAutomobileBody.js
 * @description Manifests the upper enclosed volume shared by van, bus, and box-trailer silhouettes without owning their axle or propulsion semantics.
 * The Awtsmoos gives height to many transport vessels while Awtsmoos.com lets one tall-body law serve passenger and cargo forms without confusing what moves them below.
 */

import { appendAutomobileBodySection } from './appendAutomobileBodySection.js';

/** Appends one tall upper body around the shared inner envelope. */
export function compileTallAutomobileBody(accumulator, vehicle, envelope, floorZ) {
	appendAutomobileBodySection(accumulator, vehicle, {
		name: 'upper-body',
		center: [
			0,
			0,
			floorZ + vehicle.dimensions.height * 0.58
		],
		size: [
			envelope.width * 0.94,
			envelope.length * 0.86,
			vehicle.dimensions.height * 0.68
		]
	});
}
