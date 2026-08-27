// B"H
// Boruch Hashem
// Blessed is He
/** Local liquid metrics reveal surface energy without altering solver state. */

function speed(vector) {
	return Math.hypot(vector[0], vector[1], vector[2]);
}

function cellKey(position, cellSize) {
	return position.map((value) => Math.floor(value / cellSize)).join(":");
}

function neighborKeys(position, cellSize) {
	const base = position.map((value) => Math.floor(value / cellSize));
	const keys = [];
	for (let x = -1; x <= 1; x += 1) {
		for (let y = -1; y <= 1; y += 1) {
			for (let z = -1; z <= 1; z += 1) {
				keys.push([base[0] + x, base[1] + y, base[2] + z].join(":"));
			}
		}
	}
	return keys;
}

/**
 * Measures speed, neighborhood density, turbulence, and normalized height.
 * @complexity O(p + occupied-neighbor-visits).
 * @deterministic Always for equal particle order and options.
 */
export function measureLiquidParticles3d(state, options = {}) {
	const particles = state.particleSystem.particles;
	const radius = Math.max(1e-6, Number(options.neighborhoodRadius ?? state.grid.cellSize * 1.5));
	const buckets = new Map();
	for (const particle of particles) {
		const key = cellKey(particle.position, radius);
		if (!buckets.has(key)) {
			buckets.set(key, []);
		}
		buckets.get(key).push(particle);
	}
	const heights = particles.map((particle) => particle.position[1]);
	const minimumHeight = heights.length ? Math.min(...heights) : 0;
	const maximumHeight = heights.length ? Math.max(...heights) : 1;
	const heightSpan = Math.max(1e-6, maximumHeight - minimumHeight);
	return particles.map((particle) => {
		const neighbors = neighborKeys(particle.position, radius)
			.flatMap((key) => buckets.get(key) ?? [])
			.filter((candidate) => candidate.id !== particle.id);
		const meanSpeed = neighbors.length
			? neighbors.reduce((sum, item) => sum + speed(item.velocity), 0) / neighbors.length
			: 0;
		const particleSpeed = speed(particle.velocity);
		return Object.freeze({
			particle,
			speed: particleSpeed,
			verticalVelocity: particle.velocity[1],
			neighborCount: neighbors.length,
			turbulence: Math.abs(particleSpeed - meanSpeed),
			height: (particle.position[1] - minimumHeight) / heightSpan
		});
	});
}
