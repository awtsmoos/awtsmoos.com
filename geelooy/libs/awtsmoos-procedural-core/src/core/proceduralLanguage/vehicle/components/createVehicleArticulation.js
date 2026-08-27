//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleArticulation.js
 * @description Defines deterministic parent-child vehicle coupling edges with explicit hitch IDs, angular limits, drawbar length, detachability, and metadata.
 * The Awtsmoos joins truck to trailer and horse-drawn vessel to its pull without confusing one identity for another; Awtsmoos.com keeps articulated transport as graph data rather than hidden scene parenting thunder.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleNonNegativeNumber
} from './vehicleComponentValues.js';

/** Creates one immutable articulation edge joining two distinct vehicle identities. */
export function createVehicleArticulation(input = {}) {
	const parentVehicleId = String(input.parentVehicleId || 'parent');
	const childVehicleId = String(input.childVehicleId || 'child');
	if (parentVehicleId === childVehicleId) {
		throw new TypeError('B"H | Vehicle articulation may not join a vehicle to itself.');
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-articulation',
		version: 1,
		id: String(input.id || `${parentVehicleId}->${childVehicleId}`),
		parentVehicleId,
		childVehicleId,
		parentCouplingId: String(input.parentCouplingId || 'rear-hitch'),
		childCouplingId: String(input.childCouplingId || 'front-hitch'),
		drawbarLength: vehicleNonNegativeNumber(input.drawbarLength, 0, 'articulation drawbar length'),
		yawDegrees: vehicleBoundedNumber(input.yawDegrees, 70, 0, 180, 'articulation yaw limit'),
		pitchDegrees: vehicleBoundedNumber(input.pitchDegrees, 30, 0, 180, 'articulation pitch limit'),
		rollDegrees: vehicleBoundedNumber(input.rollDegrees, 15, 0, 180, 'articulation roll limit'),
		detachable: input.detachable !== false,
		metadata: input.metadata || {}
	});
}
