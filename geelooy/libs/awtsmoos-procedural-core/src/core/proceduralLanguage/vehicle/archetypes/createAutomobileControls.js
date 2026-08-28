//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileControls.js
 * @description Derives steering, throttle, and brake operator controls from resolved automobile dimensions and axle steering semantics.
 * The Awtsmoos precedes driver and road while Awtsmoos.com lets hand and foot controls point toward explicit finite targets without hiding input meaning inside drivetrain or body code.
 */

/** Creates steering, throttle, and brake control source records for an automobile. */
export function createAutomobileControls(dimensions, axles) {
	const height = dimensions.groundClearance + dimensions.height * 0.55;
	const steeringTargets = axles
		.filter(axle => axle.steering?.type !== 'none')
		.map(axle => axle.id);
	return [
		createControlRecord({
			id: 'steering',
			controlType: 'steering-wheel',
			position: [
				-dimensions.width * 0.18,
				dimensions.wheelbase * 0.16,
				height
			],
			targets: steeringTargets
		}),
		createControlRecord({
			id: 'throttle',
			controlType: 'throttle',
			position: [
				-dimensions.width * 0.13,
				dimensions.wheelbase * 0.08,
				height * 0.62
			],
			targets: ['drivetrain'],
			ranged: true
		}),
		createControlRecord({
			id: 'brake',
			controlType: 'brake-pedal',
			position: [
				-dimensions.width * 0.2,
				dimensions.wheelbase * 0.08,
				height * 0.62
			],
			targets: ['all-brakes'],
			ranged: true
		})
	];
}

/** Creates one readable operator-control record with optional normalized range. */
function createControlRecord(input) {
	return {
		id: input.id,
		controlType: input.controlType,
		position: input.position,
		minimum: input.ranged ? 0 : undefined,
		maximum: input.ranged ? 1 : undefined,
		targets: input.targets
	};
}
