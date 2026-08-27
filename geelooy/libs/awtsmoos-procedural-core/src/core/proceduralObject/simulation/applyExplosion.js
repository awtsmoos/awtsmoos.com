// B"H
// Boruch Hashem
// Blessed is He
/** Declared energy couples to grids and particles through explicit radial falloff. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createCombustionState } from "./createCombustionState.js";
import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";

function falloff(distance, radius) {
	if (distance >= radius) return 0;
	const normalized = 1 - distance / radius;
	return normalized * normalized;
}

export function applyExplosionToParticles(system, event) {
	const particles = system.particles.map(particle => {
		const delta = particle.position.map((value, axis) => value - event.center[axis]);
		const distance = Math.max(1e-9, Math.hypot(...delta));
		const impulse = event.particleImpulse * falloff(distance, event.radius) / particle.mass;
		const velocity = particle.velocity.map((value, axis) => value + delta[axis] / distance * impulse);
		return { ...particle, velocity };
	});
	return createParticleSystem({ ...system, particles });
}

export function applyExplosionToCombustion(state, event) {
	const density = [...state.density.values];
	const temperature = [...state.temperature.values];
	const velocityX = [...state.velocity.x];
	const velocityY = [...state.velocity.y];
	for (let y = 0; y < state.density.height; y += 1) {
		for (let x = 0; x < state.density.width; x += 1) {
			const index = y * state.density.width + x;
			const dx = x * state.density.cellSize - event.center[0];
			const dy = y * state.density.cellSize - event.center[1];
			const distance = Math.max(1e-9, Math.hypot(dx, dy));
			const amount = falloff(distance, event.radius);
			density[index] += event.smoke * amount;
			temperature[index] += event.heat * amount;
			velocityX[index] += dx / distance * event.energy * amount;
			velocityY[index] += dy / distance * event.energy * amount;
		}
	}
	return createCombustionState({
		...state,
		density: createScalarGrid2d({ ...state.density, values: density }),
		temperature: createScalarGrid2d({ ...state.temperature, values: temperature }),
		velocity: createVectorGrid2d({ ...state.velocity, x: velocityX, y: velocityY })
	});
}
