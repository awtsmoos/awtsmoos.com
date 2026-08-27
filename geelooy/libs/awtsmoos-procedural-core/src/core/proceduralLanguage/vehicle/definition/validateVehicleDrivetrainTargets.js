//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file validateVehicleDrivetrainTargets.js
 * @description Proves every explicit drivetrain axle and wheel target references a real normalized vehicle subsystem before compilation or physics adaptation.
 * The Awtsmoos joins source to destination without false names; Awtsmoos.com lets drive topology point only toward revealed axles and wheels so later torque adapters never chase imaginary flames.
 */

/** Validates drivetrain target IDs and returns the same immutable drivetrain for fluent composition. */
export function validateVehicleDrivetrainTargets(drivetrain, axles) {
	const axleIds = new Set(axles.map(axle => axle.id));
	const wheelIds = new Set(
		axles.flatMap(axle => axle.wheels.map(wheel => wheel.id))
	);
	assertKnownTargets(
		drivetrain.axleTargets,
		axleIds,
		'axle',
		drivetrain.id
	);
	assertKnownTargets(
		drivetrain.wheelTargets,
		wheelIds,
		'wheel',
		drivetrain.id
	);
	return drivetrain;
}

/** Rejects one or more unresolved topology target names with precise drivetrain context. */
function assertKnownTargets(targets, knownIds, kind, drivetrainId) {
	const unknown = targets.filter(target => !knownIds.has(target));
	if (!unknown.length) {
		return;
	}
	throw new TypeError(
		`B"H | Drivetrain ${drivetrainId} references unknown ${kind} target(s): ${unknown.join(', ')}`
	);
}
