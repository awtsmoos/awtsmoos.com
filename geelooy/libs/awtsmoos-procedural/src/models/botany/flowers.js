// B"H
// Boruch Hashem
// Blessed is He
import { createRng } from '../../math/rng.js';
import { assemble, sphere } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { blade, broadLeaf, petalRing, roundedCluster, stem } from './components.js';

/** Composite flowers preserve a visible disk, ray petals, stems, and basal leaves. */
export function compositeFlowerMesh(options = {}) {
	const seed = options.seed || 'composite-flower';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const parts = [];
	for (let index = 0; index < 5; index += 1) {
		const angle = index / 5 * Math.PI * 2;
		const height = 1.1 + random() * 0.45;
		const center = [Math.cos(angle) * 0.32, height, Math.sin(angle) * 0.32];
		parts.push(stem([center[0], 0, center[2]], height, 0.035, colors.green));
		parts.push(petalRing(center, 10, 0.22, 0.34, colors.white));
		parts.push(sphere(0.16, center, colors.light, [1, 0.4, 1]));
		parts.push(broadLeaf([center[0], 0.25, center[2]], 0.48, 0.22, colors.green, angle));
	}
	return assemble(parts);
}

/** Iris geometry uses sword leaves plus three standards and three falling petals. */
export function irisClumpMesh(options = {}) {
	const seed = options.seed || 'iris-clump';
	const colors = modelPalette(seed);
	const purple = [0.44, 0.22, 0.72, 1];
	const gold = [0.95, 0.66, 0.12, 1];
	const parts = [];
	for (let index = 0; index < 9; index += 1) {
		const angle = index / 9 * Math.PI * 2;
		parts.push(blade([Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18], 1.1 + index % 3 * 0.12, 0.11, colors.green, angle, Math.sin(angle) * 0.12));
	}
	parts.push(stem([0, 0, 0], 1.45, 0.045, colors.green));
	parts.push(petalRing([0, 1.48, 0], 3, 0.18, 0.5, purple, true));
	parts.push(petalRing([0, 1.38, 0], 3, 0.28, 0.42, purple));
	parts.push(sphere(0.11, [0, 1.43, 0], gold, [1, 0.6, 1]));
	return assemble(parts);
}

/** Layered rose heads and serrated-looking leaf clusters separate roses from blobs. */
export function roseBushMesh(options = {}) {
	const seed = options.seed || 'rose-bush';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const bloom = [0.8 + random() * 0.16, 0.08 + random() * 0.12, 0.18 + random() * 0.18, 1];
	const parts = [stem([0, 0, 0], 1.25, 0.08, colors.wood)];
	for (let index = 0; index < 5; index += 1) {
		const angle = index / 5 * Math.PI * 2;
		const radius = 0.34 + random() * 0.28;
		const height = 0.72 + random() * 0.62;
		const center = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
		parts.push(stem([center[0], 0.35, center[2]], height - 0.35, 0.035, colors.wood));
		parts.push(petalRing(center, 8, 0.13, 0.24, bloom));
		parts.push(petalRing([center[0], center[1] + 0.03, center[2]], 5, 0.08, 0.17, bloom));
		parts.push(broadLeaf([center[0] * 0.55, height * 0.55, center[2] * 0.55], 0.34, 0.2, colors.green, angle));
	}
	return assemble(parts);
}

/** Tall flower spikes repeat tubular blooms along a clearly readable vertical raceme. */
export function flowerSpikeMesh(options = {}) {
	const seed = options.seed || 'flower-spike';
	const colors = modelPalette(seed);
	const bloom = [0.62, 0.28, 0.78, 1];
	const parts = [stem([0, 0, 0], 1.9, 0.045, colors.green)];
	for (let index = 0; index < 6; index += 1) {
		const angle = index * 2.35;
		parts.push(broadLeaf([0, 0.16 + index * 0.08, 0], 0.42, 0.22, colors.green, angle));
	}
	for (let row = 0; row < 7; row += 1) {
		for (let side = 0; side < 2; side += 1) {
			const angle = row * 1.72 + side * Math.PI;
			parts.push(sphere(0.15, [Math.cos(angle) * 0.16, 0.92 + row * 0.14, Math.sin(angle) * 0.16], bloom, [0.72, 1.15, 0.72]));
		}
	}
	parts.push(roundedCluster([0, 1.94, 0], 5, 0.14, colors.accent, [0.7, 1, 0.7]));
	return assemble(parts);
}
