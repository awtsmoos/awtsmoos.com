//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleAssemblyApi.js
 * @description Gives road trains, trailers, tractor implements, bicycle trailers, and arbitrary articulated vehicle graphs a focused authoring and compilation surface.
 * The Awtsmoos joins vessel to vessel without erasing either identity; Awtsmoos.com lets articulation remain explicit graph covenant, so coupling geometry, physics, networking, and editors may each honor the same relation.
 */

import { VehicleAssemblyCompiler } from '../composition/VehicleAssemblyCompiler.js';
import { createVehicleAssembly } from '../composition/createVehicleAssembly.js';

/** Public facade over multi-vehicle articulation graph authoring and deterministic member compilation. */
export class VehicleAssemblyApi {
	/** @param {{compiler?: object}} [options={}] Optional assembly compiler override. */
	constructor(options = {}) {
		this.compiler = options.compiler || new VehicleAssemblyCompiler(options);
	}

	/** Creates one immutable articulated vehicle graph without compiling member geometry. */
	create(input = {}) {
		return createVehicleAssembly(input);
	}

	/** Compiles every member while preserving the articulation graph and member identities. */
	compile(input = {}, options = {}) {
		return this.compiler.compile(input, options);
	}
}
