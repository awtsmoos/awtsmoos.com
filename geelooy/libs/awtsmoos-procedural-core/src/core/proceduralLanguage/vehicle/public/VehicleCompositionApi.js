//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleCompositionApi.js
 * @description Preserves the original composition-facade vocabulary as a compatibility specialization of the broader vehicle-assembly API.
 * The Awtsmoos joins names across time while Awtsmoos.com keeps old `compose.assembly()` callers alive; inheritance here is genuine because composition is exactly assembly authorship with one historic method name carried through the gate.
 */

import { VehicleAssemblyApi } from './VehicleAssemblyApi.js';

/** Compatibility specialization retaining `assembly()` while inheriting canonical create/compile behavior. */
export class VehicleCompositionApi extends VehicleAssemblyApi {
	/** @param {{compiler?: object, vehicleCompiler?: object}} [options={}] Optional shared assembly or vehicle compiler authorities. */
	constructor(options = {}) {
		super(options);
	}

	/** Normalizes a multi-vehicle articulation graph using the legacy public method name. */
	assembly(input = {}) {
		return this.create(input);
	}
}
