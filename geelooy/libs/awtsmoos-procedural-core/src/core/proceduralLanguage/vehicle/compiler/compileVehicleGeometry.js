//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleGeometry.js
 * @description Orchestrates base structure, arbitrary frame/body detail, occupancy, couplings, optional rich features, semantic sockets, styled axles, and deeply configurable wheels into one editable mesh.
 * The Awtsmoos renews every layer from broad silhouette to individual lug while Awtsmoos.com lets high-level ease and low-level authorship descend into one shared vessel without primitive groups or renderer-owned hierarchy.
 */

import { compileAxleGeometry } from '../geometry/compileAxleGeometry.js';
import { compileVehicleBodySections } from '../geometry/compileVehicleBodySections.js';
import { compileVehicleCouplings } from '../geometry/compileVehicleCouplings.js';
import { compileVehicleFeatureGeometry } from '../geometry/compileVehicleFeatureGeometry.js';
import { compileVehicleFeatureSockets } from '../geometry/compileVehicleFeatureSockets.js';
import { compileVehicleFrameMembers } from '../geometry/compileVehicleFrameMembers.js';
import { compileVehicleSeatGeometry } from '../geometry/compileVehicleSeatGeometry.js';
import { VehicleMeshAccumulator } from '../geometry/VehicleMeshAccumulator.js';
import { compileVehicleStructure } from './compileVehicleStructure.js';

/** Compiles one normalized vehicle definition into mesh plus semantic accumulator evidence. */
export function compileVehicleGeometry(vehicle, options = {}) {
	const accumulator = new VehicleMeshAccumulator();
	const quality = resolveVehicleQuality(vehicle, options);
	const compileOptions = {
		...options,
		quality
	};
	const structure = compileVehicleStructure(
		accumulator,
		vehicle,
		compileOptions
	);
	compileVehicleFrameMembers(accumulator, vehicle);
	compileVehicleBodySections(accumulator, vehicle);
	compileVehicleSeatGeometry(accumulator, vehicle, compileOptions);
	compileVehicleCouplings(accumulator, vehicle, {
		...compileOptions,
		geometry: structure.couplingGeometry
	});
	compileVehicleFeatureGeometry(accumulator, vehicle, compileOptions);
	compileVehicleFeatureSockets(accumulator, vehicle);
	for (const axle of vehicle.axles) {
		compileAxleGeometry(accumulator, axle, compileOptions);
	}
	const mesh = accumulator.toEditableMesh(`${vehicle.id}:mesh`, {
		vehicleId: vehicle.id,
		archetype: vehicle.archetype,
		seed: vehicle.seed
	});
	return Object.freeze({
		mesh,
		components: Object.freeze([...accumulator.components]),
		sockets: Object.freeze({ ...accumulator.sockets }),
		kinematics: Object.freeze([...accumulator.kinematics])
	});
}

/** Resolves definition quality beneath explicit one-call compile quality overrides. */
function resolveVehicleQuality(vehicle, options) {
	return {
		...(vehicle.quality || {}),
		...(options.quality || {})
	};
}
