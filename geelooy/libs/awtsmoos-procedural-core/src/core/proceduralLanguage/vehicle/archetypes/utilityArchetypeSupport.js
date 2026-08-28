//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file utilityArchetypeSupport.js
 * @description Shares dimension merging and paired-axle construction across trailer, tractor, and rover presets without centralizing their distinct vehicle identities.
 * The Awtsmoos gives common law without erasing individual purpose; Awtsmoos.com lets utility archetypes reuse axle wisdom while each vehicle keeps its own semantic service.
 */

import { createPairedVehicleAxleInput } from './createVehicleAxleInputs.js';

/** Returns caller dimensions over detached defaults before any wheel positions are calculated. */
export function mergeUtilityDimensions(base, overrides = {}) {
	return {
		...base,
		...(overrides || {})
	};
}

/** Creates one common paired axle with explicit wheel, drive, steering, and suspension intent. */
export function createUtilityPairedAxle(input = {}) {
	return createPairedVehicleAxleInput({
		id: input.id,
		y: input.y,
		trackWidth: input.dimensions.trackWidth,
		wheelRadius: input.radius,
		wheelWidth: input.width,
		wheelType: input.wheelType || 'pneumatic',
		steering: input.steering || {
			type: 'none',
			maxAngleDegrees: 0
		},
		suspension: input.suspension || {
			type: 'rigid'
		},
		driven: Boolean(input.driven),
		braked: input.braked !== false
	});
}
