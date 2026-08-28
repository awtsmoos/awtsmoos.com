//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCycleRichSystems.js
 * @description Derives rider controls, compact road lights, optional cargo, and chain/motor drivetrain topology for bicycle, motorcycle, scooter, and tricycle presets.
 * The Awtsmoos joins hand, pedal, motor, light and wheel while Awtsmoos.com lets narrow vehicles receive rich semantics without borrowing cabin, door, or automobile assumptions from another field.
 */

/** Creates rich semantic defaults for a resolved cycle archetype. */
export function createCycleRichSystems(id, dimensions, axles, propulsion) {
	const powered = propulsion.type !== 'human';
	return {
		controls: cycleControls(dimensions, axles, powered),
		lights: cycleLights(dimensions, powered),
		panels: [],
		cargoBays: cycleCargo(id, dimensions),
		drivetrain: cycleDrivetrain(axles, propulsion)
	};
}

/** Creates steering, braking, and pedal/throttle rider controls. */
function cycleControls(dimensions, axles, powered) {
	const height = dimensions.height * 0.84;
	const steeringTargets = axles
		.filter(axle => axle.steering?.type !== 'none')
		.map(axle => axle.id);
	return [
		{
			id: 'steering',
			controlType: 'handlebar',
			position: [0, dimensions.wheelbase * 0.38, height],
			targets: steeringTargets
		},
		{
			id: 'brake',
			controlType: 'hand-brake',
			minimum: 0,
			maximum: 1,
			position: [dimensions.width * 0.2, dimensions.wheelbase * 0.38, height],
			targets: ['all-brakes']
		},
		cycleDriveControl(dimensions, powered)
	];
}

/** Creates the rider's human pedal or powered throttle control record. */
function cycleDriveControl(dimensions, powered) {
	return {
		id: powered ? 'throttle' : 'pedal',
		controlType: powered ? 'twist-throttle' : 'pedal-crank',
		minimum: 0,
		maximum: 1,
		position: [0, 0, dimensions.height * 0.46],
		targets: ['drivetrain']
	};
}

/** Gives powered cycles full road lights and human cycles compact visibility markers. */
function cycleLights(dimensions, powered) {
	return [
		{
			id: 'head',
			lightType: 'headlight',
			position: [0, dimensions.length * 0.43, dimensions.height * 0.72],
			direction: [0, 1, 0],
			range: powered ? 45 : 18,
			coneDegrees: 48
		},
		{
			id: 'tail',
			lightType: 'tail',
			position: [0, -dimensions.length * 0.43, dimensions.height * 0.55],
			direction: [0, -1, 0],
			color: [1, 0, 0],
			range: 6
		}
	];
}

/** Adds a rear cargo rack for tricycle/scooter utility while keeping lean cycles clear. */
function cycleCargo(id, dimensions) {
	if (!['tricycle', 'scooter'].includes(id)) {
		return [];
	}
	return [{
		id: 'rear-cargo',
		cargoType: 'rack',
		position: [0, -dimensions.length * 0.28, dimensions.height * 0.56],
		size: [dimensions.width * 0.55, dimensions.length * 0.22, dimensions.height * 0.18],
		maxMass: id === 'tricycle' ? 45 : 18,
		enclosed: false
	}];
}

/** Creates chain or motor topology targeting the resolved driven axles. */
function cycleDrivetrain(axles, propulsion) {
	const human = propulsion.type === 'human';
	return {
		id: 'drivetrain',
		drivetrainType: human ? 'chain-intent' : 'motor-intent',
		source: 'propulsion',
		transmission: human ? 'chain' : 'direct',
		ratios: human ? [2.8, 2.1, 1.6, 1.2, 0.9] : [1],
		finalDrive: human ? 2.4 : 1,
		axleTargets: axles.filter(axle => axle.driven).map(axle => axle.id),
		regenerativeBraking: propulsion.type === 'electric'
	};
}
