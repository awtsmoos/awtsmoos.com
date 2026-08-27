//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileChassisGeometry.js
 * @description Compiles generic platform or ladder chassis directly into one editable vehicle mesh for cars, trucks, vans, buses, trailers, rovers, carts, and custom definitions.
 * The Awtsmoos carries every body upon unseen support while Awtsmoos.com lets rails and floor become one semantic chassis range without spawning grouped primitive objects at the door.
 */

import { appendVehicleBox } from './appendVehicleBox.js';
import { appendVehicleTube } from './appendVehicleTube.js';
import {
	vehicleFloorCenterZ,
	vehicleInnerEnvelope
} from './vehicleGeometryLayout.js';

/** Compiles one generic chassis according to normalized platform/ladder intent. */
export function compileChassisGeometry(accumulator, vehicle, options = {}) {
	const envelope = vehicleInnerEnvelope(vehicle);
	const floorZ = vehicleFloorCenterZ(vehicle);
	accumulator.beginComponent({
		id: `${vehicle.id}:chassis`,
		kind: 'chassis',
		materialRole: vehicle.materials.chassis || 'frame-metal',
		metadata: { chassisType: vehicle.chassis.type }
	});
	if (vehicle.chassis.type === 'ladder') {
		appendLadderFrame(accumulator, vehicle, envelope, floorZ, options);
	} else {
		appendPlatform(accumulator, vehicle, envelope, floorZ);
	}
	accumulator.endComponent();
	accumulator.socket('chassis.center', {
		kind: 'chassis-center',
		position: [0, 0, floorZ],
		forward: [0, 1, 0],
		up: [0, 0, 1]
	});
}

/** Appends one broad structural platform plate. */
function appendPlatform(accumulator, vehicle, envelope, floorZ) {
	appendVehicleBox(accumulator, {
		id: `${vehicle.id}:platform`,
		center: [0, 0, floorZ],
		size: [envelope.width, envelope.length, vehicle.chassis.thickness],
		materialRole: vehicle.materials.chassis || 'frame-metal'
	});
}

/** Appends paired longitudinal rails plus deterministic crossmembers. */
function appendLadderFrame(accumulator, vehicle, envelope, floorZ, options) {
	const railX = envelope.width * 0.33;
	const halfLength = envelope.length / 2;
	const radius = vehicle.chassis.frameRadius;
	for (const side of [-1, 1]) {
		appendVehicleTube(accumulator, {
			id: `${vehicle.id}:rail:${side}`,
			start: [side * railX, -halfLength, floorZ],
			end: [side * railX, halfLength, floorZ],
			radius,
			segments: options.quality?.frameSegments || 10,
			materialRole: vehicle.materials.chassis || 'frame-metal'
		});
	}
	for (const fraction of [-0.4, 0, 0.4]) {
		appendVehicleTube(accumulator, {
			id: `${vehicle.id}:crossmember:${fraction}`,
			start: [-railX, fraction * envelope.length, floorZ],
			end: [railX, fraction * envelope.length, floorZ],
			radius,
			segments: options.quality?.frameSegments || 10,
			materialRole: vehicle.materials.chassis || 'frame-metal'
		});
	}
}
