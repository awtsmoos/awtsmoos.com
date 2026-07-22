// B"H
// Boruch Hashem
// Blessed is He
/** Particle radii reveal the smallest world-space box that can contain the river. */

function finiteNonnegative(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number < 0) {
		throw new TypeError(`${label} must be finite and nonnegative.`);
	}
	return number;
}

export function measureParticleBounds3d(particleSystem, options = {}) {
	if (!particleSystem || !Array.isArray(particleSystem.particles)) {
		throw new TypeError("Particle bounds require a particle system.");
	}
	const radiusScale = finiteNonnegative(
		options.radiusScale,
		1,
		"Particle radius scale"
	);
	const padding = finiteNonnegative(options.padding, 0, "Particle bounds padding");
	if (particleSystem.particles.length === 0) {
		return Object.freeze({
			empty: true,
			particleCount: 0,
			min: null,
			max: null,
			size: Object.freeze([0, 0, 0]),
			maxRadius: 0
		});
	}
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	let maxRadius = 0;
	for (const particle of particleSystem.particles) {
		const radius = finiteNonnegative(
			particle.size,
			0,
			"Particle size"
		) * radiusScale + padding;
		maxRadius = Math.max(maxRadius, radius);
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], particle.position[axis] - radius);
			maximum[axis] = Math.max(maximum[axis], particle.position[axis] + radius);
		}
	}
	return Object.freeze({
		empty: false,
		particleCount: particleSystem.particles.length,
		min: Object.freeze(minimum),
		max: Object.freeze(maximum),
		size: Object.freeze(maximum.map((value, axis) => value - minimum[axis])),
		maxRadius
	});
}
