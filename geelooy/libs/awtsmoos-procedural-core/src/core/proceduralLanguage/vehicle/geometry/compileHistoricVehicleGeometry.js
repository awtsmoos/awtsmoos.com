//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHistoricVehicleGeometry.js
 * @description Compiles chariots, carts, wagons, carriages, handcarts, and wheelbarrows as open platforms, rails, baskets, handles, and drawbars.
 * The Awtsmoos carried people before engines received a name; Awtsmoos.com lets animal pole, human handle, wooden bed, and spoked wheel share the same modern JSON flame.
 */

import { appendVehicleBox } from './appendVehicleBox.js';
import { appendVehicleTube } from './appendVehicleTube.js';
import {
	vehicleFloorCenterZ,
	vehicleInnerEnvelope
} from './vehicleGeometryLayout.js';

/** Compiles an open historic/utility body whose propulsion may be animal, human, or external tow. */
export function compileHistoricVehicleGeometry(accumulator, vehicle, options = {}) {
	const floorZ = vehicleFloorCenterZ(vehicle);
	const envelope = vehicleInnerEnvelope(vehicle);
	appendHistoricPlatform(accumulator, vehicle, envelope, floorZ);
	appendHistoricRails(accumulator, vehicle, envelope, floorZ, options);
	appendHistoricDrawbars(accumulator, vehicle, envelope, floorZ, options);
	accumulator.socket('cargo.center', {
		kind: 'cargo',
		position: [0, -envelope.length * 0.05, floorZ + vehicle.dimensions.height * 0.3],
		forward: [0, 1, 0],
		up: [0, 0, 1]
	});
}

/** Appends the structural wooden or metal load floor. */
function appendHistoricPlatform(accumulator, vehicle, envelope, floorZ) {
	accumulator.beginComponent({
		id: `${vehicle.id}:historic-platform`,
		kind: 'open-platform',
		materialRole: vehicle.materials.body || 'wood'
	});
	appendVehicleBox(accumulator, {
		id: `${vehicle.id}:bed`,
		center: [0, -envelope.length * 0.05, floorZ],
		size: [envelope.width, envelope.length * 0.7, vehicle.chassis.thickness],
		materialRole: vehicle.materials.body || 'wood'
	});
	accumulator.endComponent();
}

/** Appends open side/front rails for chariot basket, cart box, or carriage safety frame. */
function appendHistoricRails(accumulator, vehicle, envelope, floorZ, options) {
	const topZ = floorZ + Math.max(0.45, vehicle.dimensions.height * 0.42);
	const frontY = envelope.length * 0.3;
	const rearY = -envelope.length * 0.38;
	const sideX = envelope.width * 0.46;
	const radius = vehicle.chassis.frameRadius;
	accumulator.beginComponent({
		id: `${vehicle.id}:historic-rails`,
		kind: 'body-rails',
		materialRole: vehicle.materials.body || 'wood'
	});
	for (const x of [-sideX, sideX]) {
		appendVehicleTube(accumulator, railTube(vehicle, [x, rearY, floorZ], [x, rearY, topZ], radius, options));
		appendVehicleTube(accumulator, railTube(vehicle, [x, rearY, topZ], [x, frontY, topZ], radius, options));
		appendVehicleTube(accumulator, railTube(vehicle, [x, frontY, floorZ], [x, frontY, topZ], radius, options));
	}
	appendVehicleTube(accumulator, railTube(vehicle, [-sideX, rearY, topZ], [sideX, rearY, topZ], radius, options));
	accumulator.endComponent();
}

/** Appends forward animal drawbar/yoke poles or human handles for explicit couplings. */
function appendHistoricDrawbars(accumulator, vehicle, envelope, floorZ, options) {
	const forwardCouplings = vehicle.couplings.filter(coupling => coupling.position[1] > 0);
	if (!forwardCouplings.length) {
		return;
	}
	accumulator.beginComponent({
		id: `${vehicle.id}:drawbars`,
		kind: 'drawbar',
		materialRole: vehicle.materials.chassis || 'wood'
	});
	for (const coupling of forwardCouplings) {
		const start = [0, envelope.length * 0.3, floorZ];
		appendVehicleTube(accumulator, {
			id: `${vehicle.id}:drawbar:${coupling.id}`,
			start,
			end: coupling.position,
			radius: vehicle.chassis.frameRadius,
			segments: options.quality?.frameSegments || 10,
			materialRole: vehicle.materials.chassis || 'wood'
		});
	}
	accumulator.endComponent();
}

/** Creates readable common tube options for historic rails. */
function railTube(vehicle, start, end, radius, options) {
	return {
		id: `${vehicle.id}:rail:${start.join(':')}:${end.join(':')}`,
		start,
		end,
		radius,
		segments: options.quality?.frameSegments || 10,
		materialRole: vehicle.materials.body || 'wood'
	};
}
