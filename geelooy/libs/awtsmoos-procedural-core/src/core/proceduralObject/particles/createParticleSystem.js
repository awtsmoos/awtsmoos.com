// B"H
// Boruch Hashem
// Blessed is He
/** Each particle bears stable identity while its finite life is renewed step by step. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { normalizeRandomSeed } from "./seededRandom.js";

function normalizeParticle(input) {
	return Object.freeze({
		id: input.id,
		position: Object.freeze([...(input.position ?? [0, 0, 0])].map(Number)),
		velocity: Object.freeze([...(input.velocity ?? [0, 0, 0])].map(Number)),
		age: Number(input.age ?? 0),
		lifetime: Math.max(0, Number(input.lifetime ?? 1)),
		mass: Math.max(1e-9, Number(input.mass ?? 1)),
		size: Math.max(0, Number(input.size ?? 1)),
		attributes: cloneManifestMetadata(input.attributes ?? {})
	});
}

export function createParticleSystem(input = {}) {
	const capacity = Math.max(0, Math.floor(input.capacity ?? 10000));
	const particles = Object.freeze((input.particles ?? []).map(normalizeParticle));
	if (particles.length > capacity) throw new RangeError("Particle capacity exceeded.");
	const seed = normalizeRandomSeed(input.seed);
	return Object.freeze({
		schema: "awtsmoos.particle-system",
		id: input.id ?? createStableId("particle.system", { seed, capacity }),
		tick: Math.max(0, Math.floor(input.tick ?? 0)),
		time: Number(input.time ?? 0),
		seed,
		capacity,
		nextId: Math.max(0, Math.floor(input.nextId ?? particles.length)),
		particles,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
