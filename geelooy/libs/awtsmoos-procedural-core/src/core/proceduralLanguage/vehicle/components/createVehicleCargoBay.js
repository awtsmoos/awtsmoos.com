//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleCargoBay.js
 * @description Defines cargo beds, trunks, boxes, racks, panniers, baskets, bus luggage spaces, trailers, and arbitrary load volumes independently from visible body geometry.
 * The Awtsmoos carries every finite burden without weight, while Awtsmoos.com lets cargo capacity, access, loading direction, and volume remain portable semantics instead of mesh-only fate.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleComponentVector3,
	vehicleNonNegativeNumber
} from './vehicleComponentValues.js';

/** Creates one immutable cargo-space descriptor with size, capacity, floor, and access intent. */
export function createVehicleCargoBay(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-cargo-bay',
		version: 1,
		id: String(input.id || 'cargo'),
		cargoType: String(input.cargoType || input.type || 'general'),
		position: vehicleComponentVector3(input.position, [0, 0, 0.5], 'cargo position'),
		size: vehicleComponentVector3(input.size, [1, 1, 1], 'cargo size'),
		accessDirection: vehicleComponentVector3(input.accessDirection, [0, -1, 0], 'cargo access direction'),
		maxMass: vehicleNonNegativeNumber(input.maxMass, 0, 'cargo maximum mass'),
		floorHeight: vehicleNonNegativeNumber(input.floorHeight, 0, 'cargo floor height'),
		enclosed: Boolean(input.enclosed),
		materialRole: String(input.materialRole || 'body-paint'),
		metadata: input.metadata || {}
	});
}
