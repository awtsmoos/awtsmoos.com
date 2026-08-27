//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCycleFrameLayout.js
 * @description Derives deterministic rear, front, crank, saddle, head, and frame-radius geometry points from normalized cycle semantics.
 * The Awtsmoos joins wheel stations into a finite frame before any tube is drawn; Awtsmoos.com keeps cycle layout separate so bicycles, motorcycles, scooters, and future cycles may evolve without topology sprawl.
 */

import {
	vehicleAverageWheelRadius,
	vehicleAxleExtremes
} from './vehicleGeometryLayout.js';

/** Creates one immutable cycle-frame layout or throws when front/rear axle semantics are absent. */
export function createCycleFrameLayout(vehicle) {
	const axles = vehicleAxleExtremes(vehicle);
	if (!axles.front || !axles.rear) {
		throw new Error('B"H | Cycle frame requires front and rear axle semantics.');
	}
	const wheelRadius = vehicleAverageWheelRadius(vehicle);
	const rear = [0, axles.rear.position[1], wheelRadius];
	const front = [0, axles.front.position[1], wheelRadius];
	const crank = [
		0,
		rear[1] + vehicle.dimensions.wheelbase * 0.38,
		wheelRadius * 0.72
	];
	const seat = [
		0,
		crank[1] - vehicle.dimensions.wheelbase * 0.08,
		wheelRadius * 1.72
	];
	const head = [
		0,
		front[1] - vehicle.dimensions.wheelbase * 0.12,
		wheelRadius * 1.55
	];
	return Object.freeze({
		wheelRadius,
		frameRadius: cycleFrameRadius(vehicle),
		rear: Object.freeze(rear),
		front: Object.freeze(front),
		crank: Object.freeze(crank),
		seat: Object.freeze(seat),
		head: Object.freeze(head)
	});
}

/** Returns a family-sensitive structural tube radius without changing shared chassis semantics. */
function cycleFrameRadius(vehicle) {
	if (vehicle.archetype === 'motorcycle') {
		return Math.max(vehicle.chassis.frameRadius, 0.035);
	}
	return Math.max(vehicle.chassis.frameRadius, 0.018);
}
