// B"H
// Boruch Hashem
// Blessed is He
import { createRng } from '../../math/rng.js';
import { assemble, sphere } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { blade, broadLeaf, branch, roundedCluster, stem } from './components.js';

/** Rounded flowering shrubs carry woody volume, broad leaves, and visible panicles. */
export function panicleShrubMesh(options = {}) {
	const seed = options.seed || 'panicle-shrub';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const bloom = [0.68 + random() * 0.2, 0.58 + random() * 0.22, 0.84, 1];
	const parts = [];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const length = 0.75 + random() * 0.5;
		const center = [Math.cos(angle) * length * 0.72, 0.72 + random() * 0.55, Math.sin(angle) * length * 0.72];
		parts.push(branch([0, 0.12, 0], length, 0.045, colors.wood, angle, 0.78));
		parts.push(broadLeaf([center[0] * 0.55, center[1] * 0.45, center[2] * 0.55], 0.42, 0.28, colors.green, angle));
		parts.push(roundedCluster(center, 7, 0.24, bloom, [1, 0.82, 1]));
	}
	return assemble(parts);
}

/** Hosta leaves radiate as broad ribbed blades around a lifted flower raceme. */
export function hostaClumpMesh(options = {}) {
	const seed = options.seed || 'hosta-clump';
	const colors = modelPalette(seed);
	const parts = [];
	for (let index = 0; index < 12; index += 1) {
		const angle = index / 12 * Math.PI * 2;
		const length = 0.72 + index % 3 * 0.1;
		parts.push(broadLeaf([0, 0.08, 0], length, 0.42, colors.green, angle, 0.18 + index % 2 * 0.08));
	}
	parts.push(stem([0, 0, 0], 1.35, 0.03, colors.green));
	for (let row = 0; row < 5; row += 1) {
		const angle = row * 2.4;
		parts.push(sphere(0.11, [Math.cos(angle) * 0.1, 0.86 + row * 0.12, Math.sin(angle) * 0.1], colors.white, [0.65, 1.1, 0.65]));
	}
	return assemble(parts);
}

/** Fern fronds use a visible spine and repeated leaflets instead of a green cloud. */
export function fernClumpMesh(options = {}) {
	const seed = options.seed || 'fern-clump';
	const colors = modelPalette(seed);
	const parts = [];
	for (let frond = 0; frond < 7; frond += 1) {
		const angle = frond / 7 * Math.PI * 2;
		const height = 0.82 + frond % 3 * 0.12;
		parts.push(blade([Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08], height, 0.035, colors.green, angle, 0.28));
		for (let row = 1; row < 7; row += 1) {
			const progress = row / 7;
			const center = [Math.cos(angle) * progress * 0.52, progress * height * 0.82, Math.sin(angle) * progress * 0.52];
			parts.push(broadLeaf(center, 0.25 * (1 - progress * 0.45), 0.1, colors.green, angle + Math.PI / 2, 0.03));
			parts.push(broadLeaf(center, 0.25 * (1 - progress * 0.45), 0.1, colors.green, angle - Math.PI / 2, 0.03));
		}
	}
	return assemble(parts);
}

/** Grass clumps separate fine blades from elevated seed plumes for distance readability. */
export function grassClumpMesh(options = {}) {
	const seed = options.seed || 'grass-clump';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const straw = [0.72, 0.58, 0.28, 1];
	const parts = [];
	for (let index = 0; index < 22; index += 1) {
		const angle = index / 22 * Math.PI * 2 + random() * 0.18;
		const radius = random() * 0.22;
		parts.push(blade([Math.cos(angle) * radius, 0, Math.sin(angle) * radius], 0.62 + random() * 0.62, 0.025, colors.green, angle, 0.2 + random() * 0.24));
	}
	for (let index = 0; index < 6; index += 1) {
		const angle = index / 6 * Math.PI * 2;
		parts.push(stem([Math.cos(angle) * 0.16, 0, Math.sin(angle) * 0.16], 1.18 + index % 2 * 0.16, 0.018, straw));
		parts.push(sphere(0.1, [Math.cos(angle) * 0.16, 1.2 + index % 2 * 0.16, Math.sin(angle) * 0.16], straw, [0.48, 2.4, 0.48]));
	}
	return assemble(parts);
}
