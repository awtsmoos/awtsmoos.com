// B"H
// Boruch Hashem
// Blessed is He
/** FLIP carries projected grid deltas while PIC remains the stable endpoint of one blend. */

import { sampleGridVelocity3d } from "./transferGridVelocityToParticles3d.js";

function particlesFrom(value) {
	const particles = Array.isArray(value) ? value : value?.particles;
	if (!Array.isArray(particles)) {
		throw new TypeError("FLIP transfer requires particles or a particle system.");
	}
	return particles;
}

function resolveBounds(position, velocity, radius, options) {
	const minimum = options.boundsMin ?? [-Infinity, -Infinity, -Infinity];
	const maximum = options.boundsMax ?? [Infinity, Infinity, Infinity];
	for (let axis = 0; axis < 3; axis += 1) {
		const lower = Number(minimum[axis]) + radius;
		const upper = Number(maximum[axis]) - radius;
		if (position[axis] < lower) {
			position[axis] = lower;
			velocity[axis] = Math.abs(velocity[axis]) * options.restitution;
		}
		if (position[axis] > upper) {
			position[axis] = upper;
			velocity[axis] = -Math.abs(velocity[axis]) * options.restitution;
		}
	}
}

export function transferGridVelocityFlipToParticles3d(
	particlesInput,
	currentGrid,
	previousGrid,
	options = {}
) {
	const deltaTime = Number(options.deltaTime ?? 0);
	const damping = Number(options.damping ?? 1);
	const restitution = Number(options.restitution ?? 0);
	const flipBlend = Math.max(0, Math.min(1, Number(options.flipBlend ?? 0.95)));
	if (![deltaTime, damping, restitution, flipBlend].every(Number.isFinite)
		|| deltaTime < 0 || damping < 0 || restitution < 0) {
		throw new TypeError("FLIP transfer parameters must be finite and nonnegative.");
	}
	const particles = particlesFrom(particlesInput).map(particle => {
		const oldVelocity = particle.velocity.map(Number);
		const current = sampleGridVelocity3d(currentGrid, particle.position);
		const previous = previousGrid
			? sampleGridVelocity3d(previousGrid, particle.position)
			: { velocity: [0, 0, 0], occupiedWeight: 0 };
		let velocity = [...oldVelocity];
		if (current.occupiedWeight > 0) {
			const pic = current.velocity;
			const delta = previous.occupiedWeight > 0
				? current.velocity.map((value, axis) => value - previous.velocity[axis])
				: [0, 0, 0];
			const flip = oldVelocity.map((value, axis) => value + delta[axis]);
			velocity = pic.map((value, axis) => (
				(value * (1 - flipBlend) + flip[axis] * flipBlend) * damping
			));
		}
		const position = particle.position.map((value, axis) => (
			Number(value) + velocity[axis] * deltaTime
		));
		resolveBounds(position, velocity, Number(particle.size ?? 0), {
			...options,
			restitution
		});
		return Object.freeze({
			...particle,
			position: Object.freeze(position),
			velocity: Object.freeze(velocity),
			age: Number(particle.age ?? 0) + deltaTime
		});
	});
	return Object.freeze({
		schema: "awtsmoos.flip-particle-transfer-3d",
		flipBlend,
		particles: Object.freeze(particles)
	});
}
