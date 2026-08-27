//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTrailerArchetype.js
 * @description Creates an unpowered tandem-axle cargo trailer with enclosed body, forward hitch, marker lights, cargo bay, access panel, braking, and explicit no-drive topology.
 * The Awtsmoos joins trailer to pulling vehicle without merging their identities; Awtsmoos.com lets dimension-derived towing and cargo semantics survive partial overrides without hidden stale geometry mysteries.
 */

import { createUtilityRichSystems } from './createUtilityRichSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';
import {
	createUtilityPairedAxle,
	mergeUtilityDimensions
} from './utilityArchetypeSupport.js';

/** Creates one complete trailer source with dimensions resolved before axle and rich-feature placement. */
export function createTrailerArchetypeSource(overrides = {}) {
	const dimensions = mergeUtilityDimensions({
		length: 5.4,
		width: 2.15,
		height: 2.45,
		wheelbase: 2.1,
		trackWidth: 1.82,
		groundClearance: 0.22
	}, overrides.dimensions);
	const radius = overrides.wheel?.radius || 0.38;
	const axles = createTrailerAxles(dimensions, radius);
	const propulsion = {
		type: 'external-tow',
		drive: 'none',
		power: 0
	};
	const source = {
		id: overrides.id || 'trailer',
		archetype: 'trailer',
		dimensions,
		chassis: {
			type: 'ladder',
			frameRadius: 0.045,
			thickness: 0.15
		},
		body: {
			type: 'trailer-box',
			enabled: true
		},
		axles,
		seats: [],
		couplings: [createTrailerHitch(dimensions)],
		propulsion,
		dynamics: {
			mass: 2800,
			tireGrip: 0.92,
			rollingResistance: 0.018,
			brakeTorque: 5200
		},
		materials: {
			chassis: 'frame-metal',
			body: 'body-paint'
		},
		...createUtilityRichSystems('trailer', dimensions, axles, propulsion)
	};
	return mergeVehicleOverrides(source, overrides);
}

/** Creates two closely spaced non-driven trailer axle stations. */
function createTrailerAxles(dimensions, radius) {
	return [
		createUtilityPairedAxle({
			id: 'front',
			y: -dimensions.wheelbase * 0.32,
			dimensions,
			radius,
			width: 0.24,
			driven: false
		}),
		createUtilityPairedAxle({
			id: 'rear',
			y: -dimensions.wheelbase * 0.62,
			dimensions,
			radius,
			width: 0.24,
			driven: false
		})
	];
}

/** Creates the forward towing socket and short visible hitch member. */
function createTrailerHitch(dimensions) {
	return {
		id: 'front-hitch',
		couplingType: 'hitch',
		position: [
			0,
			dimensions.length * 0.56,
			dimensions.groundClearance + 0.35
		],
		forward: [0, 1, 0],
		length: dimensions.length * 0.16,
		maxLoad: 12000
	};
}
