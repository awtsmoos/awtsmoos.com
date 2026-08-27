// B"H
// Boruch Hashem
// Blessed is He
/** Particle measurements expose energy, scale, bounds, and speed before trust. */

function emptyBounds() {
	return {
		minimum: [0, 0, 0],
		maximum: [0, 0, 0]
	};
}

/**
 * Measures a particle system in O(particles) without changing identity or state.
 * @returns {Object} Immutable count, mass, energy, speed, size, and bounds report.
 * @deterministic Always for equal particle state.
 * @sideEffects None.
 */
export function measureParticleSystem(system) {
	if (system.particles.length === 0) {
		return Object.freeze({
			particleCount: 0, totalMass: 0, kineticEnergy: 0,
			maximumSpeed: 0, minimumSize: 0, maximumSize: 0,
			bounds: Object.freeze(emptyBounds())
		});
	}
	const minimum = [...system.particles[0].position];
	const maximum = [...system.particles[0].position];
	let totalMass = 0;
	let kineticEnergy = 0;
	let maximumSpeed = 0;
	let minimumSize = Infinity;
	let maximumSize = 0;
	for (const particle of system.particles) {
		const speed = Math.hypot(...particle.velocity);
		totalMass += particle.mass;
		kineticEnergy += 0.5 * particle.mass * speed ** 2;
		maximumSpeed = Math.max(maximumSpeed, speed);
		minimumSize = Math.min(minimumSize, particle.size || Infinity);
		maximumSize = Math.max(maximumSize, particle.size);
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], particle.position[axis]);
			maximum[axis] = Math.max(maximum[axis], particle.position[axis]);
		}
	}
	return Object.freeze({
		particleCount: system.particles.length,
		totalMass,
		kineticEnergy,
		maximumSpeed,
		minimumSize: Number.isFinite(minimumSize) ? minimumSize : 0,
		maximumSize,
		bounds: Object.freeze({
			minimum: Object.freeze(minimum),
			maximum: Object.freeze(maximum)
		})
	});
}
