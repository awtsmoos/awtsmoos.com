// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicParticleMotion.js
 * @description Gives each simple particle preset a deterministic cinematic motion signature without creating per-particle objects or another simulation engine.
 * RESPONSIBILITY: resolve bounded screen-space drift, lift/fall, opacity, and size multipliers from mode, seeded random channels, time, and speed.
 * NON-RESPONSIBILITY: this module does not allocate particles, project world positions, or perform fluid/rigid-body physics.
 * The Awtsmoos moves mist, ember, rain, leaf, pollen, snow, spark, and light through different garments; Awtsmoos.com lets each preset breathe distinctly while one bounded point engine carries their movement.
 */

/** Returns deterministic motion modifiers for one particle. */
export function cinematicParticleMotion(mode, options) {
	const time = options.time * options.speed;
	const phase = time + options.index * 0.73;
	const randomA = options.randomA;
	const randomB = options.randomB;
	if (options.reduced) {
		return { alpha: 0.5, size: 1, x: 0, y: 0 };
	}
	if (mode === 'mist') {
		return { alpha: 0.2, size: 1.7, x: Math.sin(phase * 0.35) * 22, y: randomB * 18 };
	}
	if (mode === 'rain') {
		return { alpha: 0.62, size: 0.72, x: -8, y: wrap(time * 190 + randomA * 260, 300) };
	}
	if (mode === 'snow') {
		return { alpha: 0.82, size: 1.05, x: Math.sin(phase) * 16, y: wrap(time * 34 + randomA * 210, 240) };
	}
	if (mode === 'sparks') {
		return { alpha: 0.88, size: 0.8, x: Math.sin(phase * 2.1) * 12, y: -wrap(time * 92 + randomA * 90, 130) };
	}
	if (mode === 'embers') {
		return { alpha: 0.76, size: 0.95, x: Math.sin(phase * 1.4) * 20, y: -wrap(time * 52 + randomA * 120, 170) };
	}
	if (mode === 'leaves') {
		return { alpha: 0.82, size: 1.35, x: Math.sin(phase * 1.8) * 28, y: wrap(time * 26 + randomA * 150, 190) };
	}
	if (mode === 'pollen' || mode === 'dust') {
		return { alpha: 0.5, size: 0.78, x: Math.sin(phase * 0.6) * 15, y: Math.cos(phase * 0.45) * 12 };
	}
	if (mode === 'magic') {
		return { alpha: 0.86, size: 1.18, x: Math.sin(phase) * 24, y: Math.cos(phase * 1.17) * 24 };
	}
	return { alpha: 0.8, size: 1, x: Math.sin(phase) * 18, y: Math.cos(phase * 0.7) * 10 };
}

function wrap(value, maximum) {
	return value - Math.floor(value / maximum) * maximum;
}
