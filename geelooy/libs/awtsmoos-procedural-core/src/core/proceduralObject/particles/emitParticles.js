// B"H
// Boruch Hashem
// Blessed is He
/** Emission opens finite vessels from a deterministic stream beneath the Awtsmoos. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { normalizeVector } from "../geometry/vectorMath.js";
import { createParticleSystem } from "./createParticleSystem.js";
import { createSeededRandom } from "./seededRandom.js";

function randomDirection(random, base, spread) {
	const jitter = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
	return normalizeVector(base.map((value, index) => value + jitter[index] * spread));
}

export function emitParticles(system, emitter = {}) {
	const count = Math.max(0, Math.floor(emitter.count ?? 1));
	const available = Math.max(0, system.capacity - system.particles.length);
	const emittedCount = Math.min(count, available);
	const random = createSeededRandom(system.seed ^ system.tick ^ system.nextId ^ (emitter.seed ?? 0));
	const position = emitter.position ?? [0, 0, 0];
	const direction = normalizeVector(emitter.direction ?? [0, 1, 0]);
	const spread = Math.max(0, Number(emitter.spread ?? 0));
	const particles = [...system.particles];
	for (let index = 0; index < emittedCount; index += 1) {
		const ordinal = system.nextId + index;
		const speed = Number(emitter.speed ?? 1) * (1 + (random() * 2 - 1) * (emitter.speedVariation ?? 0));
		const velocity = randomDirection(random, direction, spread).map(value => value * speed);
		particles.push({
			id: createStableId("particle", [system.id, ordinal]),
			position, velocity, age: 0,
			lifetime: Math.max(0, Number(emitter.lifetime ?? 1) * (1 + (random() * 2 - 1) * (emitter.lifetimeVariation ?? 0))),
			mass: emitter.mass ?? 1, size: emitter.size ?? 1, attributes: emitter.attributes ?? {}
		});
	}
	return createParticleSystem({
		...system,
		particles,
		nextId: system.nextId + emittedCount
	});
}
