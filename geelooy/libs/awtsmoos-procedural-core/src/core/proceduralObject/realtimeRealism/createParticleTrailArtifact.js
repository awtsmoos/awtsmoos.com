// B"H
// Boruch Hashem
// Blessed is He
/** Velocity-derived trails give fast particles temporal continuity. */

/** Creates one two-point segment per visible particle. */
export function createParticleTrailArtifact(system, options = {}) {
	const duration = Math.max(0, Number(options.duration ?? 0.08));
	const count = system.particles.length;
	const positions = new Float32Array(count * 6);
	const widths = new Float32Array(count * 2);
	system.particles.forEach((particle, index) => {
		const offset = index * 6;
		positions.set(particle.position.map((value, axis) => (
			value - particle.velocity[axis] * duration
		)), offset);
		positions.set(particle.position, offset + 3);
		widths[index * 2] = particle.size * 0.35;
		widths[index * 2 + 1] = particle.size;
	});
	return Object.freeze({
		schema: "awtsmoos.particle-trail-artifact",
		systemId: system.id,
		segmentCount: count,
		duration,
		positions,
		widths
	});
}
