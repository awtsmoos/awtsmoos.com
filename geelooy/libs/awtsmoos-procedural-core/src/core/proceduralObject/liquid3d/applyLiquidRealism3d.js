// B"H
// Boruch Hashem
// Blessed is He
/**
 * Viscosity binds, cohesion gathers, and vorticity restores lost curls. The
 * Awtsmoos enriches the existing PIC/FLIP state without replacing its solver.
 */
import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createParticleGridLiquidState } from "./createParticleGridLiquidState.js";
import { buildLiquidNeighborhood3d } from "./buildLiquidNeighborhood3d.js";
import { createLiquidRealismProfile3d } from "./createLiquidRealismProfile3d.js";
import { evaluateLiquidNeighborPhysics3d } from "./evaluateLiquidNeighborPhysics3d.js";

function normalized(vector) {
	const length = Math.hypot(...vector);
	return length > 1e-9 ? vector.map(value => value / length) : [0, 0, 0];
}

function cross(left, right) {
	return [left[1] * right[2] - left[2] * right[1], left[2] * right[0] - left[0] * right[2], left[0] * right[1] - left[1] * right[0]];
}

/** Applies one bounded frame-level secondary-physics correction. */
export function applyLiquidRealism3d(input, options = {}) {
	const state = createParticleGridLiquidState(input);
	const profile = createLiquidRealismProfile3d(options.realism ?? options.profile ?? options);
	const radius = state.grid.cellSize * profile.neighborRadiusScale;
	const particles = state.particleSystem.particles;
	const neighborhoods = buildLiquidNeighborhood3d(particles, radius, profile.maximumNeighbors);
	const physics = evaluateLiquidNeighborPhysics3d(particles, neighborhoods, radius);
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const nextParticles = particles.map((particle, index) => {
		const viscosity = [0, 0, 0];
		const cohesion = [0, 0, 0];
		for (const neighbor of neighborhoods[index]) {
			const weight = Math.pow(1 - neighbor.q, 2);
			for (let axis = 0; axis < 3; axis += 1) {
				viscosity[axis] += (particles[neighbor.index].velocity[axis] - particle.velocity[axis]) * weight;
				cohesion[axis] += neighbor.delta[axis] / neighbor.distance * weight;
			}
		}
		const confinement = cross(normalized(physics.vorticityGradient[index]), physics.omega[index]);
		const velocity = particle.velocity.map((value, axis) => value
			+ viscosity[axis] * profile.viscosity
			+ cohesion[axis] * profile.cohesion * deltaTime
			+ confinement[axis] * profile.vorticity * deltaTime);
		return {
			...particle,
			velocity,
			attributes: {
				...particle.attributes,
				liquidDensity: physics.density[index],
				liquidNeighbors: neighborhoods[index].length,
				liquidVorticity: physics.omegaMagnitude[index],
				liquidSurfaceGradient: physics.surfaceGradient[index]
			}
		};
	});
	const particleSystem = createParticleSystem({ ...state.particleSystem, particles: nextParticles });
	return Object.freeze({
		state: createParticleGridLiquidState({ ...state, particleSystem }),
		profile,
		report: Object.freeze({
			particleCount: particles.length,
			averageNeighbors: neighborhoods.reduce((sum, value) => sum + value.length, 0) / Math.max(1, particles.length),
			averageDensity: physics.density.reduce((sum, value) => sum + value, 0) / Math.max(1, particles.length),
			maximumVorticity: Math.max(0, ...physics.omegaMagnitude)
		})
	});
}
