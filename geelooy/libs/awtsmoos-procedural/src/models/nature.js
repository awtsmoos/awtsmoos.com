// B"H
import { createRng } from '../math/rng.js';
import { assemble, box, cylinder, sphere, star } from './assembly.js';
import { modelPalette } from './palettes.js';

/** A tree grows as trunk, branch joints, layered crown, and fruit sparks. */
export function treeModelMesh(options = {}) {
	const seed = options.seed || 'tree-model';
	const random = createRng(seed);
	const colors = options.palette || modelPalette(seed);
	const parts = [cylinder(0.42, 3.8, [0, 1.9, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const radius = 0.9 + random() * 0.75;
		const height = 3.2 + random() * 1.35;
		parts.push(cylinder(0.12, radius * 1.3, [Math.cos(angle) * radius * 0.38, height - 0.55, Math.sin(angle) * radius * 0.38], colors.wood, [Math.sin(angle) * 0.9, 0, -Math.cos(angle) * 0.9], 9));
		parts.push(sphere(0.92 + random() * 0.34, [Math.cos(angle) * radius, height, Math.sin(angle) * radius], colors.green, [1, 0.82, 1]));
	}
	parts.push(sphere(1.15, [0, 4.45, 0], colors.green, [1, 0.9, 1]));
	return assemble(parts);
}

export function planterMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'planter');
	return assemble(
		box([2.4, 0.72, 1.5], [0, 0.36, 0], colors.stone),
		box([2.08, 0.48, 1.2], [0, 0.66, 0], colors.dark),
		...[-0.65, 0, 0.65].map(x => sphere(0.58, [x, 1.12, 0], colors.green, [1, 0.85, 1]))
	);
}

export function hedgeMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'hedge');
	return assemble(
		box([4.6, 0.38, 1.15], [0, 0.19, 0], colors.stone),
		...Array.from({ length: 6 }, (_, index) => sphere(0.72, [-1.9 + index * 0.76, 0.88, 0], colors.green, [1, 0.82, 0.88]))
	);
}

export function monumentMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'monument');
	return assemble(
		box([3.2, 0.5, 3.2], [0, 0.25, 0], colors.stone),
		box([2.3, 0.42, 2.3], [0, 0.7, 0], colors.trim),
		cylinder(0.58, 4.2, [0, 2.9, 0], colors.stone, [0, 0, 0], 12),
		star(1.28, 0.24, [0, 5.35, 0], colors.light, [Math.PI / 2, 0, 0])
	);
}
