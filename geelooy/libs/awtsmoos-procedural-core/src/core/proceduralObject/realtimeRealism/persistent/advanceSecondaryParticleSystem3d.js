// B"H
// Boruch Hashem
// Blessed is He
/** Persistent visual particles advance independently from primary liquid mass. */

import { createParticleSystem } from "../../particles/createParticleSystem.js";
import { collideSecondaryParticle } from "./secondaryParticleBounds.js";
import { secondaryParticleForce } from "./secondaryParticleForces.js";

function advanceParticle(particle, role, deltaTime, time, bounds, options) {
	const force = secondaryParticleForce(particle, role, time, options);
	const dragFactor = Math.exp(-force.drag * deltaTime);
	const velocity = particle.velocity.map(
		(value, axis) => (value + force.acceleration[axis] * deltaTime) * dragFactor
	);
	const position = particle.position.map(
		(value, axis) => value + velocity[axis] * deltaTime
	);
	const collision = collideSecondaryParticle(position, velocity, bounds, options.collision);
	return {
		...particle,
		position: collision.position,
		velocity: collision.velocity,
		age: particle.age + deltaTime,
		attributes: {
			...particle.attributes,
			collidedThisFrame: collision.collided
		}
	};
}

/** Advances one role system and removes expired particles. */
export function advanceSecondaryParticleSystem3d(
	system,
	role,
	deltaTime,
	time,
	bounds,
	options = {}
) {
	const particles = system.particles
		.map((particle) => advanceParticle(
			particle,
			role,
			deltaTime,
			time,
			bounds,
			options
		))
		.filter((particle) => particle.age < particle.lifetime);
	return createParticleSystem({
		...system,
		particles,
		capacity: Math.max(system.capacity, particles.length),
		metadata: {
			...system.metadata,
			lastAdvancedTime: time,
			role
		}
	});
}
