// B"H
// Boruch Hashem
// Blessed is He
/**
 * Advanced particles retain existing force semantics while gaining adaptive
 * time, rich contacts, friction, and motion lineage in Awtsmoos.com.
 */
import { createParticleSystem } from "./createParticleSystem.js";
import { sumParticleForces } from "./particleForces.js";
import { collideAdvancedParticle } from "./collideAdvancedParticles.js";
import { planParticleSubsteps } from "./planParticleSubsteps.js";

function stepParticle(particle, forces, deltaTime, context) {
	const previousPosition = [...particle.position];
	const force = sumParticleForces(forces, particle, context);
	const velocity = particle.velocity.map(
		(value, axis) => value + force[axis] / particle.mass * deltaTime
	);
	const position = particle.position.map(
		(value, axis) => value + velocity[axis] * deltaTime
	);
	const planes = (context.planes ?? []).map(plane => ({ ...plane, type: "plane" }));
	return collideAdvancedParticle({
		...particle,
		position,
		velocity,
		age: particle.age + deltaTime,
		attributes: {
			...particle.attributes,
			previousPosition
		}
	}, context.colliders ?? planes);
}

/** Runs deterministic adaptive integration and returns state plus diagnostics. */
export function stepAdvancedParticleSystem(system, options = {}) {
	const plan = planParticleSubsteps(system, options);
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const stepTime = deltaTime / plan.substeps;
	let particles = [...system.particles];
	let contacts = 0;
	for (let substep = 0; substep < plan.substeps; substep += 1) {
		const results = particles.map(particle => stepParticle(
			particle,
			options.forces ?? [],
			stepTime,
			{ ...options, time: system.time + substep * stepTime }
		));
		contacts += results.reduce((sum, result) => sum + result.contacts, 0);
		particles = results.map(result => result.particle)
			.filter(particle => particle.age < particle.lifetime);
	}
	return Object.freeze({
		system: createParticleSystem({
			...system,
			tick: system.tick + 1,
			time: system.time + deltaTime,
			particles
		}),
		report: Object.freeze({
			...plan,
			contactCount: contacts,
			removedParticleCount: system.particles.length - particles.length
		})
	});
}
