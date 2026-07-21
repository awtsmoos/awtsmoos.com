// B"H
// Boruch Hashem
// Blessed is He
/** Stable collider order resolves every particle without hidden host dependence. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { collideParticleWithSolid3d } from "./collideParticleWithSolid3d.js";
import { createSolidCollider3d } from "./createSolidCollider3d.js";

function normalizeColliders(values = []) {
	return values.map(createSolidCollider3d)
		.sort((left, right) => left.id.localeCompare(right.id));
}

export function collideParticleSystemWithSolids3d(
	particleSystem,
	colliderInputs = [],
	options = {}
) {
	const colliders = normalizeColliders(colliderInputs);
	const iterations = Math.max(1, Math.floor(options.collisionIterations ?? 1));
	let contactCount = 0;
	const projectedIds = new Set();
	const particles = particleSystem.particles.map(source => {
		let particle = source;
		for (let iteration = 0; iteration < iterations; iteration += 1) {
			for (const collider of colliders) {
				const result = collideParticleWithSolid3d(particle, collider, options);
				particle = result.particle;
				if (result.collided) {
					contactCount += 1;
					projectedIds.add(source.id);
				}
			}
		}
		return particle;
	});
	return Object.freeze({
		particleSystem: createParticleSystem({ ...particleSystem, particles }),
		contactCount,
		projectedParticleCount: projectedIds.size,
		colliderIds: Object.freeze(colliders.map(collider => collider.id))
	});
}
