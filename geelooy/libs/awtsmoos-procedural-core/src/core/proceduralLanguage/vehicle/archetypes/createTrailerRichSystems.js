//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTrailerRichSystems.js
 * @description Derives trailer marker lights, rear cargo door, freight volume, and explicit unpowered drivetrain topology.
 * The Awtsmoos joins trailer to tow vehicle without confusing their identities; Awtsmoos.com lets the trailer carry its own lights, cargo, braking context, and unpowered truth through every finite road.
 */

import { createUtilityLight } from './createUtilityLight.js';

/** Creates complete rich semantic defaults for one resolved trailer envelope. */
export function createTrailerRichSystems(dimensions) {
	const rearY = -dimensions.length * 0.49;
	return {
		controls: [],
		lights: createTrailerLights(dimensions, rearY),
		panels: [createTrailerRearDoor(dimensions, rearY)],
		cargoBays: [createTrailerCargo(dimensions)],
		drivetrain: {
			id: 'drivetrain',
			drivetrainType: 'unpowered',
			source: 'external-tow',
			transmission: 'none',
			ratios: [1],
			finalDrive: 1,
			axleTargets: []
		}
	};
}

/** Creates paired rear marker/tail lights. */
function createTrailerLights(dimensions, rearY) {
	const x = dimensions.width * 0.35;
	const z = dimensions.height * 0.34;
	return [
		createUtilityLight('tail-left', 'tail', [-x, rearY, z], [0, -1, 0], 6, [1, 0, 0]),
		createUtilityLight('tail-right', 'tail', [x, rearY, z], [0, -1, 0], 6, [1, 0, 0])
	];
}

/** Creates the rear cargo access panel. */
function createTrailerRearDoor(dimensions, rearY) {
	return {
		id: 'rear-door',
		panelType: 'cargo-door',
		position: [0, rearY, dimensions.height * 0.55],
		size: [dimensions.width * 0.78, 0.06, dimensions.height * 0.62],
		normal: [0, -1, 0],
		mechanism: 'hinge',
		hingeAxis: [0, 0, 1]
	};
}

/** Creates the enclosed freight volume descriptor. */
function createTrailerCargo(dimensions) {
	return {
		id: 'cargo',
		cargoType: 'freight',
		position: [0, -dimensions.length * 0.06, dimensions.height * 0.5],
		size: [
			dimensions.width * 0.78,
			dimensions.length * 0.72,
			dimensions.height * 0.68
		],
		maxMass: 6500,
		enclosed: true
	};
}
