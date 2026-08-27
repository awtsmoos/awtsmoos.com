// B"H
// Boruch Hashem
// Blessed is He
/** Existing secondary particles and new emissions merge under stable budgets. */

import { createParticleSystem } from "../../particles/createParticleSystem.js";

function priority(particle) {
	const turbulence = Number(particle.attributes?.turbulence ?? 0);
	const remaining = Math.max(0, particle.lifetime - particle.age);
	return turbulence * 4 + remaining;
}

/** Merges role systems, deduplicates IDs, and enforces deterministic capacity. */
export function mergeSecondaryParticleSystems3d(previous, emitted, role, options = {}) {
	const maximum = Math.max(1, Math.floor(
		options.capacities?.[role]
		?? options.maximumPerRole
		?? 4096
	));
	const byId = new Map();
	for (const particle of [...previous.particles, ...emitted.particles]) {
		byId.set(particle.id, particle);
	}
	const particles = [...byId.values()]
		.sort((left, right) => {
			const difference = priority(right) - priority(left);
			return difference || left.id.localeCompare(right.id);
		})
		.slice(0, maximum)
		.sort((left, right) => left.id.localeCompare(right.id));
	return createParticleSystem({
		...previous,
		capacity: maximum,
		particles,
		metadata: {
			...previous.metadata,
			role,
			emittedThisFrame: emitted.particles.length,
			budgetDiscarded: Math.max(0, byId.size - maximum)
		}
	});
}
