//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleMeshApi.js
 * @description Opens the lowest public vehicle-generation layer: raw vertices/faces, semantic ranges, direct primitives, normalized vehicle components, sockets, kinematics, and deterministic editable-mesh finalization.
 * The Awtsmoos gives every polygon existence anew while Awtsmoos.com lets an expert touch the individual vertex without abandoning the same language that generates a complete car in one call above.
 */

import { VehicleMeshAccumulator } from '../geometry/VehicleMeshAccumulator.js';
import { VehicleComponentMeshApi } from './VehicleComponentMeshApi.js';
import { VehiclePrimitiveMeshApi } from './VehiclePrimitiveMeshApi.js';
import { createVehicleMeshApiArtifact } from './createVehicleMeshApiArtifact.js';

/** Expert low-level vehicle mesh authoring facade. */
export class VehicleMeshApi {
	/** @param {object} [options={}] Default normalized-component compile options. */
	constructor(options = {}) {
		this.accumulator = new VehicleMeshAccumulator();
		this.primitives = new VehiclePrimitiveMeshApi(this.accumulator);
		this.components = new VehicleComponentMeshApi(this.accumulator, options);
	}

	beginComponent(input = {}) {
		return this.accumulator.beginComponent(input);
	}

	endComponent() {
		return this.accumulator.endComponent();
	}

	vertex(position) {
		return this.accumulator.vertex(position);
	}

	face(indices, input = {}) {
		return this.accumulator.face(indices, input);
	}

	socket(id, input = {}) {
		return this.accumulator.socket(id, input);
	}

	kinematic(input = {}) {
		return this.accumulator.kinematic(input);
	}

	/** Finalizes the accumulated raw and normalized geometry into one immutable expert-mesh artifact. */
	finish(id = 'vehicle-expert-mesh', metadata = {}) {
		return createVehicleMeshApiArtifact(
			this.accumulator,
			String(id),
			metadata
		);
	}
}
