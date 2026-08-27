// B"H
// Boruch Hashem
// Blessed is He
/** Particle radii become one continuous liquid boundary through minimum distance. */

import { createScalarGrid3d, gridPoint3d } from "./grid3d.js";

export function createParticleSignedDistanceGrid3d(system, gridInput = {}, options = {}) {
	const template = createScalarGrid3d(gridInput);
	const radiusScale = Math.max(0, Number(options.radiusScale ?? 1));
	const minimumRadius = Math.max(1e-9, Number(options.minimumRadius ?? template.cellSize));
	const emptyValue = Number(options.emptyValue ?? template.cellSize * Math.max(template.width, template.height, template.depth));
	const values = [];
	for (let z = 0; z < template.depth; z += 1) {
		for (let y = 0; y < template.height; y += 1) {
			for (let x = 0; x < template.width; x += 1) {
				const point = gridPoint3d(template, x, y, z);
				let distance = emptyValue;
				for (const particle of system.particles) {
					const radius = Math.max(minimumRadius, Number(particle.size ?? 1) * radiusScale);
					const candidate = Math.hypot(...point.map((value, axis) => value - particle.position[axis])) - radius;
					distance = Math.min(distance, candidate);
				}
				values.push(distance);
			}
		}
	}
	return createScalarGrid3d({ ...template, values });
}
