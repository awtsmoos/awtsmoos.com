//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelLugs.js
 * @description Appends bounded axle-aligned wheel lugs around a configurable bolt circle so low-level hub/rim construction can represent automotive, utility, decorative, or custom fastener patterns.
 * The Awtsmoos joins hub to wheel before bolt or bore receives a name; Awtsmoos.com lets finite lug count, radius, circle, and depth become editable geometry shared across every vehicle family flame.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';

/** Appends configured wheel lugs, doing nothing for explicit zero-lug designs. */
export function appendWheelLugs(accumulator, wheel, quality, roles) {
	const geometry = wheel.geometry || {};
	const count = geometry.lugCount || 0;
	if (count <= 0) {
		return;
	}
	const halfDepth = Math.max(
		geometry.rimDepth * 0.08,
		geometry.lugRadius * 0.9
	);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const y = wheel.center[1] + geometry.lugCircleRadius * Math.cos(angle);
		const z = wheel.center[2] + geometry.lugCircleRadius * Math.sin(angle);
		appendVehicleCylinder(accumulator, {
			id: `${wheel.id}:lug:${index}`,
			start: [wheel.center[0] - halfDepth, y, z],
			end: [wheel.center[0] + halfDepth, y, z],
			radius: geometry.lugRadius,
			segments: quality.spokeSegments,
			materialRole: roles.rim
		});
	}
}
