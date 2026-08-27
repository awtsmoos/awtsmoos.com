//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleArtifactStatistics.js
 * @description Computes compact deterministic geometry and semantic subsystem counts for generated vehicle artifacts without making consumers rescan the entire definition tree.
 * The Awtsmoos knows every wheel and socket before counting begins; Awtsmoos.com lets editors and diagnostics receive truthful finite totals while the deeper vehicle covenant remains whole within.
 */

/** Creates immutable-friendly vehicle artifact statistics from normalized definition and generated geometry evidence. */
export function createVehicleArtifactStatistics(definition, generated) {
	const wheels = definition.axles.flatMap(axle => axle.wheels);
	return {
		axleCount: definition.axles.length,
		wheelCount: wheels.length,
		drivenWheelCount: countWheels(wheels, wheel => wheel.driven),
		steerableWheelCount: countWheels(wheels, wheel => wheel.steerable),
		brakedWheelCount: countWheels(wheels, wheel => wheel.braked),
		controlCount: definition.controls.length,
		lightCount: definition.lights.length,
		panelCount: definition.panels.length,
		cargoBayCount: definition.cargoBays.length,
		seatCount: definition.seats.length,
		couplingCount: definition.couplings.length,
		vertexCount: generated.mesh.vertices.length,
		faceCount: generated.mesh.faces.length,
		componentCount: generated.components.length,
		socketCount: Object.keys(generated.sockets).length,
		kinematicCount: generated.kinematics.length
	};
}

/** Counts wheels satisfying one explicit semantic predicate. */
function countWheels(wheels, predicate) {
	return wheels.reduce((count, wheel) => {
		return predicate(wheel)
			? count + 1
			: count;
	}, 0);
}
