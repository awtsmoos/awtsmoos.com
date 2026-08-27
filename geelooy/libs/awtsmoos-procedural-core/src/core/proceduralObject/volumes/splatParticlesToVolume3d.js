// B"H
// Boruch Hashem
// Blessed is He
/** Particle kernels become density, heat, and emission without losing stable IDs. */
import { createScalarGrid3d, gridIndex3d } from "./grid3d.js";

function clampIndex(value, maximum) {
	return Math.max(0, Math.min(maximum - 1, value));
}

/** Splat particles into three dense scalar grids with compact polynomial kernels. */
export function splatParticlesToVolume3d(particles, plan, options = {}) {
	const length = plan.width * plan.height * plan.depth;
	const density = Array(length).fill(0);
	const temperature = Array(length).fill(0);
	const emission = Array(length).fill(0);
	for (const particle of particles) {
		const radius = Math.max(plan.cellSize, particle.size * Number(options.radiusScale ?? 1.5));
		const cellRadius = Math.max(1, Math.ceil(radius / plan.cellSize));
		const center = particle.position.map((value, axis) => (
			(value - plan.origin[axis]) / plan.cellSize
		));
		for (let z = -cellRadius; z <= cellRadius; z += 1) {
			for (let y = -cellRadius; y <= cellRadius; y += 1) {
				for (let x = -cellRadius; x <= cellRadius; x += 1) {
					const gx = clampIndex(Math.round(center[0] + x), plan.width);
					const gy = clampIndex(Math.round(center[1] + y), plan.height);
					const gz = clampIndex(Math.round(center[2] + z), plan.depth);
					const point = [gx, gy, gz].map((value, axis) => plan.origin[axis] + value * plan.cellSize);
					const distance = Math.hypot(...point.map((value, axis) => value - particle.position[axis]));
					if (distance > radius) continue;
					const weight = Math.pow(1 - distance / radius, 3);
					const index = gridIndex3d(plan, gx, gy, gz);
					density[index] += weight * Number(particle.attributes?.density ?? 1);
					temperature[index] += weight * Number(particle.attributes?.temperature ?? 0);
					emission[index] += weight * Number(particle.attributes?.emission ?? 0);
				}
			}
		}
	}
	return Object.freeze({
		density: createScalarGrid3d({ ...plan, values: density }),
		temperature: createScalarGrid3d({ ...plan, values: temperature }),
		emission: createScalarGrid3d({ ...plan, values: emission })
	});
}
