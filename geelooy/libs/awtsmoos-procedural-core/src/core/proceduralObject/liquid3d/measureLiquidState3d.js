// B"H
// Boruch Hashem
// Blessed is He
/** Metrics make mass, energy, stability, and divergence visible before trust is granted. */

import { measureVelocityDivergence3d } from "../simulation3d/projectVelocity3d.js";

export function measureGridDivergenceL1(velocityGrid) {
	return measureVelocityDivergence3d(velocityGrid).values
		.reduce((sum, value) => sum + Math.abs(value), 0);
}

export function measureLiquidState3d(state, options = {}) {
	let particleMass = 0;
	let kineticEnergy = 0;
	let maxSpeed = 0;
	for (const particle of state.particleSystem.particles) {
		const speed = Math.hypot(...particle.velocity);
		particleMass += particle.mass;
		kineticEnergy += 0.5 * particle.mass * speed ** 2;
		maxSpeed = Math.max(maxSpeed, speed);
	}
	const gridMass = state.massGrid.values.reduce((sum, value) => sum + value, 0);
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 0));
	return Object.freeze({
		particleCount: state.particleSystem.particles.length,
		particleMass,
		gridMass,
		gridMassError: gridMass - particleMass,
		kineticEnergy,
		maxSpeed,
		cfl: state.grid.cellSize > 0
			? maxSpeed * deltaTime / state.grid.cellSize
			: 0,
		activeCellCount: state.massGrid.values.filter(value => value > 0).length,
		divergenceL1: measureGridDivergenceL1(state.velocityGrid)
	});
}
