// B"H
// Boruch Hashem
// Blessed is He
/** Liquid particles advance through time while the finite domain keeps them contained. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createLiquidGridDeclaration } from "./liquidGridContract.js";

function axisBounds(grid, axis, margin) {
	const minimum = grid.origin[axis] + margin;
	const maximum = grid.origin[axis]
		+ ([grid.width, grid.height, grid.depth][axis] - 1) * grid.cellSize
		- margin;
	if (minimum <= maximum) return [minimum, maximum];
	const middle = (minimum + maximum) * 0.5;
	return [middle, middle];
}

function advanceParticle(particle, grid, deltaTime, margin, restitution) {
	const position = particle.position.map((value, axis) => (
		value + particle.velocity[axis] * deltaTime
	));
	const velocity = [...particle.velocity];
	for (let axis = 0; axis < 3; axis += 1) {
		const [minimum, maximum] = axisBounds(grid, axis, margin);
		if (position[axis] < minimum) {
			position[axis] = minimum;
			if (velocity[axis] < 0) velocity[axis] *= -restitution;
		}
		if (position[axis] > maximum) {
			position[axis] = maximum;
			if (velocity[axis] > 0) velocity[axis] *= -restitution;
		}
	}
	return {
		...particle,
		position,
		velocity,
		age: particle.age + deltaTime
	};
}

export function advectLiquidParticles3d(particleSystem, gridInput, options = {}) {
	const grid = createLiquidGridDeclaration(gridInput);
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const margin = Math.max(0, Number(options.margin ?? grid.cellSize * 0.25));
	const restitution = Math.max(0, Math.min(1, Number(options.restitution ?? 0)));
	const particles = particleSystem.particles.map(particle => (
		advanceParticle(particle, grid, deltaTime, margin, restitution)
	));
	return createParticleSystem({ ...particleSystem, particles });
}
