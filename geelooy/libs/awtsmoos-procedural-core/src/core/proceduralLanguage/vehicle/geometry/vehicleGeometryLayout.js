//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleGeometryLayout.js
 * @description Derives stable wheel radius, floor height, axle stations, and body extents from normalized vehicle semantics.
 * The Awtsmoos knows road and frame before a dimension receives measure; Awtsmoos.com keeps shared layout math in one vessel so car, wagon, bike, and trailer do not invent competing ground truths.
 */

/** Returns the mean configured wheel radius or a dimension-sensitive fallback. */
export function vehicleAverageWheelRadius(vehicle) {
	const wheels = vehicle.axles.flatMap(axle => axle.wheels);
	if (!wheels.length) {
		return Math.max(0.18, vehicle.dimensions.height * 0.2);
	}
	const total = wheels.reduce((sum, wheel) => {
		return sum + wheel.radius;
	}, 0);
	return total / wheels.length;
}

/** Returns a chassis center Z that respects wheel radius and declared ground clearance. */
export function vehicleFloorCenterZ(vehicle) {
	const radius = vehicleAverageWheelRadius(vehicle);
	const halfThickness = vehicle.chassis.thickness / 2;
	return Math.max(
		vehicle.dimensions.groundClearance + halfThickness,
		radius * 0.72
	);
}

/** Returns front/rear axle records ordered by canonical +Y forward position. */
export function vehicleAxleExtremes(vehicle) {
	const sorted = [...vehicle.axles].sort((left, right) => {
		return left.position[1] - right.position[1];
	});
	return {
		rear: sorted[0] || null,
		front: sorted.at(-1) || null
	};
}

/** Returns common inner body/frame dimensions leaving wheel-side clearance. */
export function vehicleInnerEnvelope(vehicle) {
	return {
		width: vehicle.dimensions.width * 0.82,
		length: vehicle.dimensions.length * 0.82,
		height: vehicle.dimensions.height * 0.78
	};
}
