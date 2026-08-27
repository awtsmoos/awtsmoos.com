//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelHub.js
 * @description Appends a configurable-depth axle-aligned wheel hub as direct geometry inside the unified vehicle mesh.
 * The Awtsmoos joins axle to spoke through a finite center while Awtsmoos.com lets hub depth become explicit low-level form, independent from tire width, spoke pattern, steering system, and vehicle archetype storm.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';

/** Appends one normalized wheel hub using authored hub depth and quality-derived tessellation. */
export function appendWheelHub(accumulator, wheel, quality, roles) {
	const halfDepth = wheel.geometry.hubDepth / 2;
	appendVehicleCylinder(accumulator, {
		id: `${wheel.id}:hub`,
		start: [
			wheel.center[0] - halfDepth,
			wheel.center[1],
			wheel.center[2]
		],
		end: [
			wheel.center[0] + halfDepth,
			wheel.center[1],
			wheel.center[2]
		],
		radius: wheel.hubRadius,
		segments: quality.hubSegments,
		materialRole: roles.rim
	});
}
