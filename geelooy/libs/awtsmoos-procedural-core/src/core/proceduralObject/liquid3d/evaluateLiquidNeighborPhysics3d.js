// B"H
// Boruch Hashem
// Blessed is He
/**
 * Density, curl, and surface gradient reveal the hidden motion between drops.
 * The Awtsmoos gives Awtsmoos.com inspectable neighbor physics, never an
 * unexplained aesthetic force.
 */
function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function add(target, value, scale = 1) {
	for (let axis = 0; axis < 3; axis += 1) target[axis] += value[axis] * scale;
}

/** Evaluates normalized kernel density, surface gradients, and vorticity. */
export function evaluateLiquidNeighborPhysics3d(particles, neighborhoods, radius) {
	const density = new Float64Array(particles.length);
	const surfaceGradient = Array.from({ length: particles.length }, () => [0, 0, 0]);
	const omega = Array.from({ length: particles.length }, () => [0, 0, 0]);
	for (let index = 0; index < particles.length; index += 1) {
		density[index] = 1;
		for (const neighbor of neighborhoods[index]) {
			const weight = Math.pow(1 - neighbor.q, 3);
			const gradientScale = -3 * Math.pow(1 - neighbor.q, 2) / Math.max(radius * neighbor.distance, 1e-9);
			const gradient = neighbor.delta.map(value => value * gradientScale);
			density[index] += weight;
			add(surfaceGradient[index], gradient);
			const velocityDelta = particles[neighbor.index].velocity.map((value, axis) => value - particles[index].velocity[axis]);
			add(omega[index], cross(velocityDelta, gradient));
		}
	}
	const omegaMagnitude = Float64Array.from(omega, value => Math.hypot(...value));
	const vorticityGradient = Array.from({ length: particles.length }, () => [0, 0, 0]);
	for (let index = 0; index < particles.length; index += 1) {
		for (const neighbor of neighborhoods[index]) {
			const scale = (omegaMagnitude[neighbor.index] - omegaMagnitude[index])
				* Math.pow(1 - neighbor.q, 2) / Math.max(radius * neighbor.distance, 1e-9);
			add(vorticityGradient[index], neighbor.delta, scale);
		}
	}
	return Object.freeze({ density, surfaceGradient: Object.freeze(surfaceGradient), omega: Object.freeze(omega), omegaMagnitude, vorticityGradient: Object.freeze(vorticityGradient) });
}
