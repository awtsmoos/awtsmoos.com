// B"H
// Boruch Hashem
// Blessed is He
/**
 * Turbulence is deterministic texture in space and time, not an invisible random
 * hand. Awtsmoos.com samples a smooth curl-like field so replay, branching, and
 * CPU/GPU adapters can share the same seeded motion intent.
 */

function phase(seed, channel) {
	return (Number(seed) || 0) * 0.000123 + channel * 2.0943951023931953;
}

/**
 * Samples a bounded deterministic curl-like turbulence vector in O(1).
 * @param {number[]} position World-space point.
 * @param {Object} options Frequency, time, seed, and evolution speed.
 * @returns {number[]} Three-component vector in approximately [-2, 2].
 * @deterministic Always for equal inputs.
 * @sideEffects None.
 */
export function sampleParticleTurbulence(position, options = {}) {
	const frequency = Math.max(1e-9, Number(options.frequency ?? 1));
	const time = Number(options.time ?? 0) * Number(options.evolution ?? 1);
	const seed = Number(options.seed ?? 0);
	const x = position[0] * frequency + phase(seed, 0);
	const y = position[1] * frequency + phase(seed, 1);
	const z = position[2] * frequency + phase(seed, 2);
	return Object.freeze([
		Math.sin(y + time) - Math.cos(z - time * 0.73),
		Math.sin(z + time * 0.83) - Math.cos(x - time),
		Math.sin(x + time * 0.61) - Math.cos(y - time * 0.91)
	]);
}
