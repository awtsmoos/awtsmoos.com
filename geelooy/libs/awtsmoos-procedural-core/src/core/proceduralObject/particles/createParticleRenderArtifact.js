// B"H
// Boruch Hashem
// Blessed is He
/**
 * Simulation state becomes one compact renderer-neutral particle vessel. The
 * Awtsmoos gives Awtsmoos.com motion, life, color, ordering, and trail buffers.
 */
function colorOf(particle) {
	const value = particle.attributes?.color ?? [1, 1, 1, 1];
	return [
		Number(value[0] ?? 1),
		Number(value[1] ?? 1),
		Number(value[2] ?? 1),
		Number(value[3] ?? 1)
	];
}

function depthOf(particle, viewDirection) {
	return particle.position.reduce(
		(sum, value, axis) => sum + value * viewDirection[axis],
		0
	);
}

/** Packs particles and optional two-point trails into typed arrays. */
export function createParticleRenderArtifact(system, options = {}) {
	const viewDirection = options.viewDirection ?? [0, 0, -1];
	const sorted = [...system.particles].sort((left, right) => (
		depthOf(right, viewDirection) - depthOf(left, viewDirection)
		|| String(left.id).localeCompare(String(right.id))
	));
	const trails = [];
	for (const particle of sorted) {
		const previous = particle.attributes?.previousPosition;
		if (Array.isArray(previous)) {
			trails.push(...previous, ...particle.position);
		}
	}
	return Object.freeze({
		schema: "awtsmoos.particle-render-artifact",
		sourceSystemId: system.id,
		tick: system.tick,
		ids: Object.freeze(sorted.map(particle => particle.id)),
		positions: new Float32Array(sorted.flatMap(particle => particle.position)),
		velocities: new Float32Array(sorted.flatMap(particle => particle.velocity)),
		motionVectors: new Float32Array(sorted.flatMap(particle => {
			const previous = particle.attributes?.previousPosition ?? particle.position;
			return particle.position.map((value, axis) => value - previous[axis]);
		})),
		sizes: new Float32Array(sorted.map(particle => particle.size)),
		colors: new Float32Array(sorted.flatMap(colorOf)),
		normalizedAge: new Float32Array(sorted.map(particle => (
			particle.lifetime > 0 ? particle.age / particle.lifetime : 1
		))),
		trailSegments: new Float32Array(trails),
		metadata: Object.freeze({
			particleCount: sorted.length,
			trailCount: trails.length / 6,
			sortMode: "back-to-front"
		})
	});
}
