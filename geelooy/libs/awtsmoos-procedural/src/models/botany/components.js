// B"H
// Boruch Hashem
// Blessed is He
import { assemble, box, cylinder } from '../assembly.js';

/**
 * The Awtsmoos reveals leaves and petals through light faceted vessels. Thin boxes
 * preserve silhouette while avoiding hundreds of triangles per tiny botanical part.
 */
export function stem(position, height, radius, color, lean = [0, 0, 0]) {
	return cylinder(radius, height, [position[0], position[1] + height * 0.5, position[2]], color, lean, 8);
}

export function blade(position, height, width, color, angle = 0, lean = 0) {
	return box(
		[width, height, width * 0.22],
		[position[0], position[1] + height * 0.5, position[2]],
		color,
		[lean, angle, 0]
	);
}

export function broadLeaf(position, length, width, color, angle, rise = 0.2) {
	const x = position[0] + Math.cos(angle) * length * 0.32;
	const z = position[2] + Math.sin(angle) * length * 0.32;
	return box(
		[length, width, 0.035],
		[x, position[1] + rise, z],
		color,
		[0.16, -angle, 0]
	);
}

export function petalRing(center, count, radius, petalLength, color, vertical = false) {
	const petals = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const x = center[0] + Math.cos(angle) * radius;
		const z = center[2] + Math.sin(angle) * radius;
		petals.push(box(
			vertical ? [0.08, petalLength, 0.18] : [petalLength, 0.06, 0.18],
			[x, center[1], z],
			color,
			vertical ? [0, -angle, 0.22] : [0, -angle, 0]
		));
	}
	return assemble(petals);
}

export function roundedCluster(center, count, radius, color, scale = [1, 1, 1]) {
	const flowers = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const ring = index % 3 === 0 ? radius * 0.35 : radius * 0.72;
		flowers.push(box(
			[radius * scale[0], radius * scale[1], radius * scale[2]],
			[
				center[0] + Math.cos(angle) * ring,
				center[1] + ((index % 4) - 1.5) * radius * 0.18,
				center[2] + Math.sin(angle) * ring
			],
			color,
			[index * 0.13, angle, 0]
		));
	}
	return assemble(flowers);
}

export function branch(position, length, radius, color, angle, lift = 0.55) {
	const x = position[0] + Math.cos(angle) * length * 0.38;
	const z = position[2] + Math.sin(angle) * length * 0.38;
	return cylinder(
		radius,
		length,
		[x, position[1] + length * lift * 0.5, z],
		color,
		[Math.sin(angle) * (1.1 - lift), 0, -Math.cos(angle) * (1.1 - lift)],
		8
	);
}
