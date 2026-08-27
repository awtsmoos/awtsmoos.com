// B"H
// Boruch Hashem
// Blessed is He
/** A finite particle cloud receives a bounded voxel vessel. */
function boundsOf(particles, padding) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const particle of particles) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], particle.position[axis] - padding);
			maximum[axis] = Math.max(maximum[axis], particle.position[axis] + padding);
		}
	}
	if (!particles.length) return { minimum: [-1, -1, -1], maximum: [1, 1, 1] };
	return { minimum, maximum };
}

/** Plans an isotropic grid that encloses all particles. */
export function planParticleVolumeGrid3d(particles, options = {}) {
	if (options.grid) return Object.freeze({ ...options.grid });
	const padding = Math.max(0.001, Number(options.padding ?? 0.25));
	const bounds = boundsOf(particles, padding);
	const resolution = Math.max(4, Math.floor(options.resolution ?? 32));
	const span = bounds.maximum.map((value, axis) => value - bounds.minimum[axis]);
	const cellSize = Math.max(...span, 0.001) / Math.max(1, resolution - 1);
	return Object.freeze({
		width: Math.max(2, Math.ceil(span[0] / cellSize) + 1),
		height: Math.max(2, Math.ceil(span[1] / cellSize) + 1),
		depth: Math.max(2, Math.ceil(span[2] / cellSize) + 1),
		cellSize,
		origin: Object.freeze([...bounds.minimum])
	});
}
