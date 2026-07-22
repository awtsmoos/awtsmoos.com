// B"H
// Boruch Hashem
// Blessed is He
/** Particle systems become compact upload-ready typed arrays. */

const ROLE_COLORS = Object.freeze({
	spray: [0.72, 0.9, 1, 0.82],
	foam: [0.94, 0.98, 1, 0.95],
	bubble: [0.55, 0.82, 1, 0.45],
	mist: [0.82, 0.92, 1, 0.32],
	default: [1, 1, 1, 1]
});

/** Creates positions, velocities, sizes, ages, and colors for CPU/GPU rendering. */
export function createParticleRenderArtifact(system, options = {}) {
	const count = system.particles.length;
	const positions = new Float32Array(count * 3);
	const velocities = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	const ages = new Float32Array(count * 2);
	const colors = new Float32Array(count * 4);
	system.particles.forEach((particle, index) => {
		positions.set(particle.position, index * 3);
		velocities.set(particle.velocity, index * 3);
		sizes[index] = particle.size;
		ages[index * 2] = particle.age;
		ages[index * 2 + 1] = particle.lifetime;
		const role = particle.attributes.role ?? system.metadata.role ?? "default";
		colors.set(options.colors?.[role] ?? ROLE_COLORS[role] ?? ROLE_COLORS.default, index * 4);
	});
	return Object.freeze({
		schema: "awtsmoos.particle-render-artifact",
		systemId: system.id,
		count,
		primitive: options.primitive ?? "camera-facing-disc",
		positions,
		velocities,
		sizes,
		ages,
		colors,
		softParticles: options.softParticles !== false,
		motionBlur: options.motionBlur !== false
	});
}
