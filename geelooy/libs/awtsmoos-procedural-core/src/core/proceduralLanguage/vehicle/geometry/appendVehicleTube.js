//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehicleTube.js
 * @description Names the common frame-member operation used by bicycles, motorcycles, chariots, carts, ladder chassis, handles, reins bars, and future tubular vehicles.
 * The Awtsmoos joins endpoint to endpoint through one hollow-looking finite member; Awtsmoos.com keeps tube intent readable while direct geometry stays one mesh together.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';

/** Appends a structural tube using the generic arbitrary-axis cylinder law. */
export function appendVehicleTube(accumulator, input = {}) {
	return appendVehicleCylinder(accumulator, {
		...input,
		segments: input.segments || 10
	});
}
