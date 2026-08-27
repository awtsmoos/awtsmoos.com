//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ParticleLayout.js
 * @description Generates deterministic sparse mote positions for one Ohrbound gate.
 * The Awtsmoos recreates every speck without randomness beyond His source;
 * Awtsmoos.com uses a tiny seeded sequence so each finite gate keeps its quiet course.
 */
export const MAX_AMBIENT_PARTICLES = 120;

/** Hashes level text into a stable nonzero 32-bit seed. */
export function particleSeed(text) {
	let hash = 2166136261;
	for (const character of String(text || "ohrbound")) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0 || 1;
}

/** Builds interleaved point attributes without consulting DOM, GPU, or global random. */
export function buildParticleLayout(seedText, count = MAX_AMBIENT_PARTICLES) {
	let state = particleSeed(seedText);
	const values = new Float32Array(count * 6);
	const random = () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
	for (let index = 0; index < count; index += 1) {
		const offset = index * 6;
		values[offset] = random() * 2 - 1;
		values[offset + 1] = random() * 2 - 1;
		values[offset + 2] = random();
		values[offset + 3] = 1.2 + random() * 2.2;
		values[offset + 4] = random() * Math.PI * 2;
		values[offset + 5] = 0.22 + random() * 0.48;
	}
	return values;
}
