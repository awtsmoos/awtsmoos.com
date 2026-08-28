//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRoverArchetype.js
 * @description Creates a six-wheel electric rover with three driven bogie-intent axles, joystick, work light, payload bay, and distributed drivetrain while preserving dimension-derived coherence under overrides.
 * The Awtsmoos turns six wheels across distant ground while Awtsmoos.com lets every axle and payload follow the resolved vessel dimensions instead of stale placement hidden underground.
 */

import { createUtilityRichSystems } from './createUtilityRichSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';
import {
	createUtilityPairedAxle,
	mergeUtilityDimensions
} from './utilityArchetypeSupport.js';

/** Creates one complete rover source with dimensions resolved before axle and rich-system placement. */
export function createRoverArchetypeSource(overrides = {}) {
	const dimensions = mergeUtilityDimensions({
		length: 2.8,
		width: 2.2,
		height: 1.35,
		wheelbase: 1.75,
		trackWidth: 1.8,
		groundClearance: 0.32
	}, overrides.dimensions);
	const axles = createRoverAxles(dimensions);
	const propulsion = {
		type: 'electric',
		drive: 'all',
		power: 12000
	};
	const source = {
		id: overrides.id || 'rover',
		archetype: 'rover',
		dimensions,
		chassis: {
			type: 'ladder',
			frameRadius: 0.04,
			thickness: 0.13
		},
		body: {
			type: 'none',
			enabled: false
		},
		axles,
		seats: [],
		couplings: [],
		propulsion,
		dynamics: {
			mass: 420,
			tireGrip: 1.1,
			rollingResistance: 0.04,
			driveTorque: 900,
			brakeTorque: 1100
		},
		materials: {
			chassis: 'frame-metal',
			body: 'body-paint'
		},
		...createUtilityRichSystems('rover', dimensions, axles, propulsion)
	};
	return mergeVehicleOverrides(source, overrides);
}

/** Creates three paired driven bogie-intent axle stations. */
function createRoverAxles(dimensions) {
	const stations = [
		dimensions.wheelbase * 0.42,
		0,
		-dimensions.wheelbase * 0.42
	];
	return stations.map((y, index) => {
		return createUtilityPairedAxle({
			id: `axle-${index + 1}`,
			y,
			dimensions,
			radius: 0.32,
			width: 0.18,
			driven: true,
			steering: {
				type: 'differential-intent',
				maxAngleDegrees: 0
			},
			suspension: {
				type: 'bogie-intent',
				travel: 0.12
			}
		});
	});
}
