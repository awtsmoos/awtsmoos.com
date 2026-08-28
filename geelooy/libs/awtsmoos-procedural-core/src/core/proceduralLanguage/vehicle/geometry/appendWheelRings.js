//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelRings.js
 * @description Appends independently controllable tire and rim cross-sections using elliptical or superelliptic torus topology from one low-level wheel-geometry style.
 * The Awtsmoos turns ring within ring while Awtsmoos.com lets bicycle narrowness, balloon sidewall, square shoulder, deep rim, wood hoop, and modern rubber vary without changing the vehicle that receives their fire.
 */

import { appendVehicleEllipticalTorus } from './appendVehicleEllipticalTorus.js';

/** Appends the outer tire/hoop and inner rim according to normalized quality, geometry style, and material roles. */
export function appendWheelRings(accumulator, wheel, quality, roles) {
	appendWheelTire(accumulator, wheel, quality, roles);
	appendWheelRim(accumulator, wheel, quality, roles);
}

/** Appends a width-independent radial tire cross-section whose outer radius remains the authored wheel radius. */
function appendWheelTire(accumulator, wheel, quality, roles) {
	const geometry = wheel.geometry;
	const radialHeight = Math.min(
		wheel.radius * 0.4,
		Math.max(
			wheel.width * 0.5,
			wheel.radius * 0.08
		) * geometry.sidewallScale
	);
	appendVehicleEllipticalTorus(accumulator, {
		id: `${wheel.id}:tire`,
		center: wheel.center,
		majorRadius: Math.max(
			wheel.radius - radialHeight,
			wheel.radius * 0.52
		),
		tubeHalfWidth: wheel.width * 0.5 * geometry.treadWidthScale,
		tubeHeight: radialHeight,
		crossSection: geometry.crossSection,
		radialSegments: quality.radialSegments,
		tubeSegments: quality.tubeSegments,
		materialRole: roles.tire
	});
}

/** Appends a deep configurable structural rim ring around the authored rim radius. */
function appendWheelRim(accumulator, wheel, quality, roles) {
	const geometry = wheel.geometry;
	const radialHeight = Math.max(
		geometry.rimLipWidth,
		wheel.radius * 0.025
	);
	appendVehicleEllipticalTorus(accumulator, {
		id: `${wheel.id}:rim`,
		center: wheel.center,
		majorRadius: Math.max(
			wheel.rimRadius - radialHeight,
			wheel.hubRadius * 1.4
		),
		tubeHalfWidth: Math.max(
			geometry.rimDepth / 2,
			radialHeight
		),
		tubeHeight: radialHeight,
		crossSection: 'round',
		radialSegments: quality.radialSegments,
		tubeSegments: Math.max(
			4,
			Math.floor(quality.tubeSegments * 0.75)
		),
		materialRole: roles.rim
	});
}
