//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTractorRichSystems.js
 * @description Derives tractor operator controls, work lighting, engine cover panel, and geared driven-axle topology.
 * The Awtsmoos turns field, wheel and implement anew while Awtsmoos.com lets agricultural controls and drivetrain remain explicit semantics rather than hidden assumptions beneath a painted hood.
 */

import { createUtilityLight } from './createUtilityLight.js';

/** Creates complete rich semantic defaults for one resolved tractor. */
export function createTractorRichSystems(dimensions, axles) {
	return {
		controls: createTractorControls(dimensions),
		lights: [createUtilityLight(
			'work-front',
			'work',
			[0, dimensions.length * 0.42, dimensions.height * 0.62],
			[0, 1, -0.1],
			45
		)],
		panels: [createTractorEngineCover(dimensions)],
		cargoBays: [],
		drivetrain: {
			id: 'drivetrain',
			drivetrainType: 'shaft-intent',
			source: 'propulsion',
			transmission: 'gearbox-intent',
			ratios: [5.2, 3.3, 2.1, 1.3, 0.9],
			finalDrive: 4.6,
			axleTargets: axles
				.filter(axle => axle.driven)
				.map(axle => axle.id)
		}
	};
}

/** Creates steering, throttle, and service-brake operator controls. */
function createTractorControls(dimensions) {
	return [
		{
			id: 'steering',
			controlType: 'steering-wheel',
			position: [0, dimensions.wheelbase * 0.08, dimensions.height * 0.62],
			targets: ['front']
		},
		{
			id: 'throttle',
			controlType: 'throttle',
			minimum: 0,
			maximum: 1,
			position: [0.18, 0, dimensions.height * 0.55],
			targets: ['drivetrain']
		},
		{
			id: 'brake',
			controlType: 'brake-pedal',
			minimum: 0,
			maximum: 1,
			position: [-0.18, 0, dimensions.height * 0.42],
			targets: ['all-brakes']
		}
	];
}

/** Creates the hinged engine-cover panel. */
function createTractorEngineCover(dimensions) {
	return {
		id: 'engine-cover',
		panelType: 'hood',
		position: [0, dimensions.length * 0.22, dimensions.height * 0.56],
		size: [dimensions.width * 0.62, dimensions.length * 0.3, 0.08],
		normal: [0, 0, 1],
		mechanism: 'hinge',
		hingeAxis: [1, 0, 0]
	};
}
