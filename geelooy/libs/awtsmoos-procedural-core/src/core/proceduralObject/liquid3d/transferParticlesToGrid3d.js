// B"H
// Boruch Hashem
// Blessed is He
/** Particle mass and momentum enter the grid before pressure reshapes the flow. */

import { createScalarGrid3d, createVectorGrid3d } from "../volumes/grid3d.js";
import { createLiquidGridDeclaration } from "./liquidGridContract.js";
import { particleGridWeights3d } from "./particleGridWeights3d.js";

export function transferParticlesToGrid3d(particleSystem, gridInput) {
	const grid = createLiquidGridDeclaration(gridInput);
	const length = grid.width * grid.height * grid.depth;
	const mass = Array(length).fill(0);
	const momentumX = Array(length).fill(0);
	const momentumY = Array(length).fill(0);
	const momentumZ = Array(length).fill(0);
	let particleMass = 0;
	for (const particle of particleSystem.particles) {
		particleMass += particle.mass;
		for (const entry of particleGridWeights3d(grid, particle.position)) {
			const depositedMass = particle.mass * entry.weight;
			mass[entry.index] += depositedMass;
			momentumX[entry.index] += depositedMass * particle.velocity[0];
			momentumY[entry.index] += depositedMass * particle.velocity[1];
			momentumZ[entry.index] += depositedMass * particle.velocity[2];
		}
	}
	const velocityX = mass.map((value, index) => value > 0 ? momentumX[index] / value : 0);
	const velocityY = mass.map((value, index) => value > 0 ? momentumY[index] / value : 0);
	const velocityZ = mass.map((value, index) => value > 0 ? momentumZ[index] / value : 0);
	const gridMass = mass.reduce((sum, value) => sum + value, 0);
	return Object.freeze({
		massGrid: createScalarGrid3d({ ...grid, values: mass }),
		velocityGrid: createVectorGrid3d({
			...grid,
			x: velocityX,
			y: velocityY,
			z: velocityZ
		}),
		particleMass,
		gridMass,
		activeCellCount: mass.filter(value => value > 0).length
	});
}
