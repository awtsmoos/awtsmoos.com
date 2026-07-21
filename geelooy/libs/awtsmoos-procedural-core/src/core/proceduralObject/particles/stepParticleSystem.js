// B"H
// Boruch Hashem
// Blessed is He
/** Time advances in bounded substeps while stable particle names endure. */

import { createParticleSystem } from "./createParticleSystem.js";
import { sumParticleForces } from "./particleForces.js";

function collidePlanes(position, velocity, planes) {
	for (const plane of planes) {
		const normal = plane.normal ?? [0, 1, 0];
		const offset = Number(plane.offset ?? 0);
		const distance = position.reduce((sum, value, axis) => sum + value * normal[axis], -offset);
		if (distance >= 0) continue;
		for (let axis = 0; axis < 3; axis += 1) position[axis] -= distance * normal[axis];
		const normalVelocity = velocity.reduce((sum, value, axis) => sum + value * normal[axis], 0);
		if (normalVelocity < 0) {
			const bounce = 1 + Number(plane.restitution ?? 0.2);
			for (let axis = 0; axis < 3; axis += 1) velocity[axis] -= bounce * normalVelocity * normal[axis];
		}
	}
}

function stepParticle(particle, forces, dt, context) {
	const position = [...particle.position];
	const velocity = [...particle.velocity];
	const force = sumParticleForces(forces, particle, context);
	for (let axis = 0; axis < 3; axis += 1) {
		velocity[axis] += force[axis] / particle.mass * dt;
		position[axis] += velocity[axis] * dt;
	}
	collidePlanes(position, velocity, context.planes ?? []);
	return { ...particle, position, velocity, age: particle.age + dt };
}

export function stepParticleSystem(system, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const substeps = Math.max(1, Math.floor(options.substeps ?? 1));
	const dt = deltaTime / substeps;
	let particles = [...system.particles];
	for (let step = 0; step < substeps; step += 1) {
		particles = particles.map(particle => stepParticle(
			particle,
			options.forces ?? [],
			dt,
			{ ...options, time: system.time + step * dt }
		)).filter(particle => particle.age < particle.lifetime);
	}
	return createParticleSystem({
		...system,
		tick: system.tick + 1,
		time: system.time + deltaTime,
		particles
	});
}
