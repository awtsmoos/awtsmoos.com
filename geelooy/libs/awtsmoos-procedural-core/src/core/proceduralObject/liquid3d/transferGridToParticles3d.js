// B"H
// Boruch Hashem
// Blessed is He
/** PIC steadies and FLIP remembers as grid motion returns to stable particles. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { sampleVectorGrid3d } from "../volumes/sampleGrid3d.js";
import { clampLiquidBlend } from "./liquidGridContract.js";

function mixedVelocity(particle, currentGrid, previousGrid, blend) {
	const pic = sampleVectorGrid3d(currentGrid, particle.position);
	const previous = sampleVectorGrid3d(previousGrid, particle.position);
	const flip = particle.velocity.map((value, axis) => (
		value + pic[axis] - previous[axis]
	));
	return pic.map((value, axis) => (
		value * (1 - blend) + flip[axis] * blend
	));
}

export function transferGridToParticles3d(
	particleSystem,
	currentGrid,
	previousGrid,
	blend = 0.95
) {
	const normalizedBlend = clampLiquidBlend(blend);
	const particles = particleSystem.particles.map(particle => ({
		...particle,
		velocity: mixedVelocity(
			particle,
			currentGrid,
			previousGrid,
			normalizedBlend
		)
	}));
	return createParticleSystem({ ...particleSystem, particles });
}
