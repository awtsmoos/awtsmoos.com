// B"H
// Boruch Hashem
// Blessed is He
/** Time advances in bounded substeps while stable particle names endure. */

import { createParticleSystem } from "./createParticleSystem.js";
import { measureParticleSystem } from "./measureParticleSystem.js";
import { planParticleSubsteps } from "./planParticleSubsteps.js";
import { sumParticleForces } from "./particleForces.js";

function normalizedPlane(plane) {
	const source = plane.normal ?? [0, 1, 0];
	const length = Math.hypot(...source) || 1;
	return {
		...plane,
		normal: source.map(value => value / length),
		offset: Number(plane.offset ?? 0)
	};
}

function collidePlanes(position, velocity, planes) {
	let collisions = 0;
	for (const declaration of planes) {
		const plane = normalizedPlane(declaration);
		const distance = position.reduce((sum, value, axis) => (
			sum + value * plane.normal[axis]
		), -plane.offset);
		if (distance >= 0) continue;
		collisions += 1;
		for (let axis = 0; axis < 3; axis += 1) {
			position[axis] -= distance * plane.normal[axis];
		}
		const normalVelocity = velocity.reduce((sum, value, axis) => (
			sum + value * plane.normal[axis]
		), 0);
		if (normalVelocity >= 0) continue;
		const restitution = Math.max(0, Number(plane.restitution ?? 0.2));
		const friction = Math.max(0, Math.min(1, Number(plane.friction ?? 0)));
		for (let axis = 0; axis < 3; axis += 1) {
			const normalComponent = normalVelocity * plane.normal[axis];
			const tangentComponent = velocity[axis] - normalComponent;
			velocity[axis] = tangentComponent * (1 - friction)
				- normalComponent * restitution;
		}
	}
	return collisions;
}

function stepParticle(particle, forces, dt, context) {
	const position = [...particle.position];
	const velocity = [...particle.velocity];
	const force = sumParticleForces(forces, particle, context);
	for (let axis = 0; axis < 3; axis += 1) {
		velocity[axis] += force[axis] / particle.mass * dt;
		position[axis] += velocity[axis] * dt;
	}
	const collisions = collidePlanes(position, velocity, context.planes ?? []);
	return {
		particle: { ...particle, position, velocity, age: particle.age + dt },
		collisions
	};
}

/**
 * Advances particles and returns stability, energy, collision, and expiry evidence.
 * @returns {{system:Object,report:Object}} Immutable next state and diagnostics.
 * @complexity O(substeps × particles × forces).
 * @deterministic Always for equal state and options.
 * @sideEffects None.
 */
export function stepParticleSystemDetailed(system, options = {}) {
	const before = measureParticleSystem(system);
	const plan = planParticleSubsteps(system, options);
	const dt = plan.deltaTime / plan.substeps;
	const forces = options.forces ?? [];
	let particles = [...system.particles];
	let collisionCount = 0;
	let expiredCount = 0;
	for (let step = 0; step < plan.substeps; step += 1) {
		const advanced = particles.map(particle => stepParticle(
			particle,
			forces,
			dt,
			{ ...options, seed: system.seed, time: system.time + step * dt }
		));
		collisionCount += advanced.reduce((sum, item) => sum + item.collisions, 0);
		expiredCount += advanced.filter(item => item.particle.age >= item.particle.lifetime).length;
		particles = advanced.map(item => item.particle)
			.filter(particle => particle.age < particle.lifetime);
	}
	const nextSystem = createParticleSystem({
		...system,
		tick: system.tick + 1,
		time: system.time + plan.deltaTime,
		particles
	});
	const after = measureParticleSystem(nextSystem);
	return Object.freeze({
		system: nextSystem,
		report: Object.freeze({
			qualityProfile: plan.profile.name,
			substeps: plan.substeps,
			substepPlan: plan,
			collisionCount,
			expiredCount,
			forceTypes: Object.freeze(forces.map(force => force.type ?? "gravity")),
			particleCountBefore: before.particleCount,
			particleCountAfter: after.particleCount,
			kineticEnergyBefore: before.kineticEnergy,
			kineticEnergyAfter: after.kineticEnergy,
			maximumSpeedAfter: after.maximumSpeed,
			boundsAfter: after.bounds
		})
	});
}

/** Preserves the original state-only particle stepping API. */
export function stepParticleSystem(system, options = {}) {
	return stepParticleSystemDetailed(system, options).system;
}
