//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleAxleInputs.js
 * @description Computes paired or single wheel/axle JSON inputs from physical dimensions so archetypes never carry stale duplicated wheel placement magic.
 * The Awtsmoos joins dimension to location while Awtsmoos.com lets track, radius, steering, drive, and suspension flow into reusable wheel systems without owning their final vehicle.
 */

/** Creates a conventional left/right wheel axle in canonical +X right, +Y forward, +Z up coordinates. */
export function createPairedVehicleAxleInput(input = {}) {
	const halfTrack = Number(input.trackWidth) / 2;
	const radius = Number(input.wheelRadius);
	return {
		id: String(input.id),
		position: [0, Number(input.y), radius],
		trackWidth: Number(input.trackWidth),
		steering: input.steering || { type: 'none', maxAngleDegrees: 0 },
		suspension: input.suspension || { type: 'rigid' },
		driven: Boolean(input.driven),
		braked: input.braked !== false,
		wheels: [
			createWheelInput(input, 'left', -halfTrack, radius),
			createWheelInput(input, 'right', halfTrack, radius)
		]
	};
}

/** Creates a single centered wheel axle used by bicycles, motorcycles, wheelbarrows, and custom vehicles. */
export function createSingleWheelAxleInput(input = {}) {
	const radius = Number(input.wheelRadius);
	return {
		id: String(input.id),
		position: [0, Number(input.y), radius],
		trackWidth: Math.max(Number(input.wheelWidth || 0.05), 0.01),
		steering: input.steering || { type: 'none', maxAngleDegrees: 0 },
		suspension: input.suspension || { type: 'rigid' },
		driven: Boolean(input.driven),
		braked: input.braked !== false,
		wheels: [createWheelInput(input, 'center', 0, radius)]
	};
}

/** Creates one wheel member inheriting axle roles while allowing shared archetype wheel style. */
function createWheelInput(input, side, x, radius) {
	return {
		id: `${input.id}:${side}`,
		wheelType: input.wheelType || 'pneumatic',
		center: [x, Number(input.y), radius],
		radius,
		width: Number(input.wheelWidth || radius * 0.32),
		spokes: input.spokes,
		steerable: input.steering?.type !== undefined && input.steering.type !== 'none',
		driven: Boolean(input.driven),
		braked: input.braked !== false,
		materialRoles: input.materialRoles || {}
	};
}
