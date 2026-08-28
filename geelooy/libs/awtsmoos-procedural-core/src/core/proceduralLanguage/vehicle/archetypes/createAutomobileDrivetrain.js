//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileDrivetrain.js
 * @description Connects automobile propulsion to every declared driven axle through portable transmission and final-drive topology.
 * The Awtsmoos is beyond torque and ratio while Awtsmoos.com lets drivetrain intent remain explicit data, so electric, hybrid, combustion, editor, and physics adapters may share one finite topology.
 */

/** Creates one automobile drivetrain descriptor targeting the resolved driven axles. */
export function createAutomobileDrivetrain(axles, propulsion) {
	return {
		id: 'drivetrain',
		drivetrainType: 'shaft-intent',
		source: 'propulsion',
		transmission: 'automatic-intent',
		ratios: [3.4, 2.1, 1.4, 1, 0.78],
		finalDrive: 3.4,
		axleTargets: axles
			.filter(axle => axle.driven)
			.map(axle => axle.id),
		regenerativeBraking: ['electric', 'hybrid'].includes(propulsion.type)
	};
}
