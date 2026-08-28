//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleSeatGeometry.js
 * @description Publishes occupant sockets and optionally manifests seats, benches, or saddles as direct geometry inside one vehicle mesh.
 * The Awtsmoos carries driver and passenger before cushion receives form; Awtsmoos.com keeps occupancy semantic so a standing chariot rider and a bus bench may share one lawful door.
 */

import { appendVehicleBox } from './appendVehicleBox.js';

/** Compiles every normalized occupant record into sockets and optional seat geometry. */
export function compileVehicleSeatGeometry(accumulator, vehicle) {
	for (const seat of vehicle.seats) {
		publishSeatSocket(accumulator, seat);
		if (seat.seatType === 'standing') {
			continue;
		}
		appendSeatVolume(accumulator, vehicle, seat);
	}
}

/** Publishes one stable occupant attachment socket. */
function publishSeatSocket(accumulator, seat) {
	accumulator.socket(`seat.${seat.id}`, {
		kind: 'occupant',
		role: seat.role,
		capacity: seat.capacity,
		position: seat.position,
		forward: seat.forward,
		up: seat.up
	});
}

/** Appends one compact seat volume scaled by declared occupant capacity. */
function appendSeatVolume(accumulator, vehicle, seat) {
	const width = Math.min(
		vehicle.dimensions.width * 0.72,
		Math.max(0.38, seat.capacity * 0.46)
	);
	const depth = seat.seatType === 'bench'
		? 0.52
		: 0.44;
	const height = seat.seatType === 'saddle'
		? 0.1
		: 0.16;
	accumulator.beginComponent({
		id: `${vehicle.id}:seat:${seat.id}`,
		kind: `seat-${seat.seatType}`,
		materialRole: seat.materialRole
	});
	appendVehicleBox(accumulator, {
		id: `${vehicle.id}:seat-box:${seat.id}`,
		center: seat.position,
		size: [width, depth, height],
		materialRole: seat.materialRole
	});
	accumulator.endComponent();
}
