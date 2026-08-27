//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleLightGeometry.js
 * @description Optionally manifests semantic headlights, lamps, indicators, beacons, and markers as compact direction-aware emissive bodies in the unified editable mesh.
 * The Awtsmoos gives light before lamp, yet Awtsmoos.com lets declared emitters receive finite geometry when requested; optical simulation remains renderer law while the physical lamp body joins the vehicle quest.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';
import {
	addVehicleVector,
	normalizeVehicleVector,
	scaleVehicleVector
} from './vehicleGeometryMath.js';

/** Appends all configured light bodies without changing semantic sockets or optical intent. */
export function compileVehicleLightGeometry(accumulator, vehicle, options = {}) {
	for (const light of vehicle.lights) {
		appendLightBody(accumulator, vehicle, light, options);
	}
}

/** Appends one shallow cylinder whose axis follows the light's declared direction. */
function appendLightBody(accumulator, vehicle, light, options) {
	const radius = resolveLightRadius(vehicle, options);
	const direction = normalizeVehicleVector(light.direction, [0, 1, 0]);
	const halfDepth = radius * 0.32;
	const start = addVehicleVector(
		light.position,
		scaleVehicleVector(direction, -halfDepth)
	);
	const end = addVehicleVector(
		light.position,
		scaleVehicleVector(direction, halfDepth)
	);
	accumulator.beginComponent({
		id: `${vehicle.id}:light:${light.id}`,
		kind: `light-${light.lightType}`,
		materialRole: light.materialRole
	});
	appendVehicleCylinder(accumulator, {
		id: `${vehicle.id}:light-body:${light.id}`,
		start,
		end,
		radius,
		segments: options.quality?.lightSegments || 10,
		materialRole: light.materialRole
	});
	accumulator.endComponent();
}

/** Derives a compact lamp scale from vehicle envelope unless the compile call supplies one. */
function resolveLightRadius(vehicle, options) {
	if (Number.isFinite(Number(options.lightRadius))) {
		return Math.max(0.005, Number(options.lightRadius));
	}
	const smallestDimension = Math.min(
		vehicle.dimensions.width,
		vehicle.dimensions.height
	);
	return Math.max(0.025, smallestDimension * 0.025);
}
