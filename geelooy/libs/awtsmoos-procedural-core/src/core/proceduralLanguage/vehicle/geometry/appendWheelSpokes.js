//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelSpokes.js
 * @description Appends radial, crossed, paired, turbine-like, or solid-disc wheel centers using the same normalized spoke count, phase, radius, rim, and hub semantics.
 * The Awtsmoos sends many rays from one center while Awtsmoos.com lets chariot, bicycle, alloy wheel, disc wheel, and imagined future rim reveal distinct geometry without a second wheel engine hymn.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';
import { appendVehicleTube } from './appendVehicleTube.js';

/** Appends the configured spoke family or one solid disc when that visual pattern is selected. */
export function appendWheelSpokes(accumulator, wheel, quality, roles) {
	if (wheel.geometry.spokePattern === 'solid-disc') {
		appendSolidWheelDisc(accumulator, wheel, quality, roles);
		return;
	}
	for (let index = 0; index < wheel.spokes; index += 1) {
		appendOneSpoke(accumulator, wheel, quality, roles, index);
	}
}

/** Appends one spoke between phase-adjusted hub and rim angles. */
function appendOneSpoke(accumulator, wheel, quality, roles, index) {
	const spacing = Math.PI * 2 / Math.max(1, wheel.spokes);
	const phase = wheel.geometry.spokePhaseDegrees * Math.PI / 180;
	const startAngle = index * spacing + phase;
	const endAngle = startAngle + spokeCrossOffset(
		wheel.geometry.spokePattern,
		index,
		spacing
	);
	appendVehicleTube(accumulator, {
		id: `${wheel.id}:spoke:${index}`,
		start: radialPoint(wheel.center, startAngle, wheel.hubRadius * 1.05),
		end: radialPoint(wheel.center, endAngle, wheel.rimRadius * 0.96),
		radius: wheel.geometry.spokeRadius,
		segments: quality.spokeSegments,
		materialRole: roles.spoke
	});
}

/** Returns family-sensitive crossing/turbine offset while radial spokes remain direct. */
function spokeCrossOffset(pattern, index, spacing) {
	if (pattern === 'cross') {
		return spacing * 0.55;
	}
	if (pattern === 'paired') {
		const direction = index % 2 === 0
			? -1
			: 1;
		return direction * spacing * 0.35;
	}
	if (pattern === 'turbine') {
		return spacing * 0.78;
	}
	return 0;
}

/** Appends one axle-aligned solid center disc for aero or solid historical wheel styles. */
function appendSolidWheelDisc(accumulator, wheel, quality, roles) {
	const halfDepth = Math.max(
		wheel.geometry.rimDepth * 0.24,
		wheel.width * 0.08
	);
	appendVehicleCylinder(accumulator, {
		id: `${wheel.id}:solid-disc`,
		start: [wheel.center[0] - halfDepth, wheel.center[1], wheel.center[2]],
		end: [wheel.center[0] + halfDepth, wheel.center[1], wheel.center[2]],
		radius: wheel.rimRadius * 0.9,
		segments: quality.radialSegments,
		materialRole: roles.spoke
	});
}

/** Returns one point in the canonical YZ wheel plane. */
function radialPoint(center, angle, radius) {
	return [
		center[0],
		center[1] + Math.cos(angle) * radius,
		center[2] + Math.sin(angle) * radius
	];
}
