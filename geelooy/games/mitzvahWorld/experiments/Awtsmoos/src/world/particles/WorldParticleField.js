// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldParticleField.js
 * @description Samples bounded deterministic particle centers and scales from immutable world-particle specifications.
 * The Awtsmoos creates each mote without randomness escaping its vessel; Awtsmoos.com uses one seeded sequence,
 * so mist, pollen, and orbital-inspired metaphor fields rebuild identically in gameplay, Studio, tests, and final renders.
 */

export function sampleWorldParticleField(spec) {
	const random = seededRandom(spec.seed);
	const particles = [];
	for (let index = 0; index < spec.count; index += 1) {
		const offset = spec.motionModel.startsWith('orbital')
			? orbitalOffset(random, spec.bounds, index, spec.count)
			: ellipsoidOffset(random, spec.bounds);
		particles.push(Object.freeze({
			index,
			phase: random() * Math.PI * 2,
			scale: lerp(spec.size[0], spec.size[1], random()),
			x: spec.anchor[0] + offset[0],
			y: spec.anchor[1] + offset[1],
			z: spec.anchor[2] + offset[2]
		}));
	}
	return Object.freeze(particles);
}

function ellipsoidOffset(random, bounds) {
	const radius = Math.cbrt(random());
	const azimuth = random() * Math.PI * 2;
	const vertical = random() * 2 - 1;
	const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
	return [
		Math.cos(azimuth) * horizontal * bounds[0] * 0.5 * radius,
		vertical * bounds[1] * 0.5 * radius,
		Math.sin(azimuth) * horizontal * bounds[2] * 0.5 * radius
	];
}

function orbitalOffset(random, bounds, index, count) {
	const shell = 0.28 + (index % 4) * 0.16 + random() * 0.08;
	const angle = index / Math.max(1, count) * Math.PI * 10 + random() * 0.35;
	const tilt = ((index % 3) - 1) * 0.42;
	return [
		Math.cos(angle) * bounds[0] * shell * 0.5,
		Math.sin(angle * 0.7 + tilt) * bounds[1] * shell * 0.36,
		Math.sin(angle) * bounds[2] * shell * 0.5
	];
}

function seededRandom(seed) {
	let state = (Number(seed) >>> 0) || 1;
	return () => {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		return (state >>> 0) / 4294967296;
	};
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}
