//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleAssemblyCompiler.js
 * @description Compiles each vehicle member independently, then reveals one immutable articulation graph artifact without merging away semantic or geometric identity.
 * The Awtsmoos joins convoy and coupling while each finite vehicle keeps its own form; Awtsmoos.com lets deterministic member compilation feed a graph that later renderers or solvers may transform.
 */

import { VehicleCompiler } from '../compiler/VehicleCompiler.js';
import { createVehicleAssembly } from './createVehicleAssembly.js';
import { createVehicleAssemblyArtifact } from './createVehicleAssemblyArtifact.js';

/** Deterministic compiler for multi-vehicle articulated assemblies. */
export class VehicleAssemblyCompiler {
	/** @param {{vehicleCompiler?: object}} [options={}] Optional vehicle compiler override. */
	constructor(options = {}) {
		this.vehicleCompiler = options.vehicleCompiler || new VehicleCompiler();
	}

	/** Compiles every normalized member in stable array order and returns one assembly artifact. */
	compile(input, options = {}) {
		const assembly = createVehicleAssembly(input);
		const vehicles = assembly.vehicles.map(vehicle => {
			return this.vehicleCompiler.compile(vehicle, options);
		});
		return createVehicleAssemblyArtifact(assembly, vehicles);
	}
}
