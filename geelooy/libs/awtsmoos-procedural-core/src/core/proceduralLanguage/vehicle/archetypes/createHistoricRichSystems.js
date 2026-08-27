//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createHistoricRichSystems.js
 * @description Derives reins or handle controls, cargo volumes, and external/human drivetrain topology for chariots, carts, wagons, carriages, handcarts, and wheelbarrows.
 * The Awtsmoos joins ancient travel and modern data without confusing their eras; Awtsmoos.com lets reins, cargo, hands, wheels, and animal force become inspectable semantic stars.
 */

/** Creates rich defaults from already-resolved historic dimensions, axles, and propulsion kind. */
export function createHistoricRichSystems(id, dimensions, axles, propulsionType) {
	return {
		controls: historicControls(dimensions, propulsionType),
		lights: [],
		panels: [],
		cargoBays: historicCargo(id, dimensions),
		drivetrain: historicDrivetrain(axles, propulsionType)
	};
}

/** Gives animal vehicles reins and human-powered vehicles push/pull handle semantics. */
function historicControls(dimensions, propulsionType) {
	const animal = propulsionType === 'animal';
	return [{
		id: animal ? 'reins' : 'human-control',
		controlType: animal ? 'reins' : 'push-pull-handle',
		position: [0, dimensions.length * 0.28, dimensions.height * 0.68],
		minimum: -1,
		maximum: 1,
		targets: animal ? ['animal-yoke'] : ['human-handles']
	}];
}

/** Creates useful load-space semantics for utility/passenger historic vehicles. */
function historicCargo(id, dimensions) {
	if (id === 'chariot') {
		return [];
	}
	return [{
		id: 'cargo',
		cargoType: id === 'carriage' ? 'luggage' : 'general',
		position: [0, -dimensions.length * 0.12, dimensions.height * 0.42],
		size: [dimensions.width * 0.72, dimensions.length * 0.48, dimensions.height * 0.34],
		maxMass: cargoCapacity(id),
		enclosed: id === 'carriage'
	}];
}

/** Returns conservative semantic payload defaults without claiming structural engineering certification. */
function cargoCapacity(id) {
	const capacities = {
		cart: 450,
		wagon: 1100,
		carriage: 250,
		handcart: 120,
		wheelbarrow: 80
	};
	return capacities[id] || 0;
}

/** Describes external or human transfer rather than pretending to simulate animal/human biomechanics. */
function historicDrivetrain(axles, propulsionType) {
	return {
		id: 'drivetrain',
		drivetrainType: propulsionType === 'human'
			? 'human-direct-intent'
			: 'external-draw-intent',
		source: 'propulsion',
		transmission: 'direct',
		ratios: [1],
		finalDrive: 1,
		axleTargets: axles.filter(axle => axle.driven).map(axle => axle.id)
	};
}
