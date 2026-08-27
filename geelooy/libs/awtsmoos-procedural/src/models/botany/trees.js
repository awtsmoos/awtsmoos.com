// B"H
// Boruch Hashem
// Blessed is He
import { createRng } from '../../math/rng.js';
import { assemble, box, cylinder } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { branch, roundedCluster } from './components.js';

/** Cypress crowns rise as narrow stacked columns rather than generic green balls. */
export function cypressTreeMesh(options = {}) {
	const seed = options.seed || 'cypress-tree';
	const colors = modelPalette(seed);
	const parts = [cylinder(0.26, 3.2, [0, 1.6, 0], colors.wood, [0, 0, 0], 10)];
	for (let level = 0; level < 6; level += 1) {
		const progress = level / 5;
		parts.push(box([0.78 - progress * 0.22, 1.35, 0.78 - progress * 0.22], [0, 1.1 + level * 0.62, 0], colors.green, [0, level * 0.28, 0]));
	}
	return assemble(parts);
}

/** Broadleaf trees expose trunk, radial limbs, and separated crown pads. */
export function broadleafTreeMesh(options = {}) {
	const seed = options.seed || 'broadleaf-tree';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const parts = [cylinder(0.38, 3.4, [0, 1.7, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		const length = 1.2 + random() * 0.9;
		parts.push(branch([0, 2.2, 0], length, 0.1, colors.wood, angle, 0.7));
		parts.push(box([1.8, 1.1, 1.5], [Math.cos(angle) * length * 0.8, 3 + random() * 1.1, Math.sin(angle) * length * 0.8], colors.green, [0.08, angle, 0.12]));
	}
	parts.push(box([2.1, 1.5, 1.9], [0, 4, 0], colors.green, [0.08, 0.34, 0]));
	return assemble(parts);
}

/** Willow crowns hang in curtains around an open center and water-facing trunk. */
export function willowTreeMesh(options = {}) {
	const seed = options.seed || 'willow-tree';
	const colors = modelPalette(seed);
	const willow = [0.48, 0.68, 0.24, 1];
	const parts = [cylinder(0.34, 3.8, [0, 1.9, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 9; index += 1) {
		const angle = index / 9 * Math.PI * 2;
		const radius = 1.3 + index % 3 * 0.28;
		parts.push(branch([0, 2.55, 0], radius, 0.07, colors.wood, angle, 0.62));
		for (let drop = 0; drop < 4; drop += 1) {
			const x = Math.cos(angle) * radius * (0.58 + drop * 0.08);
			const z = Math.sin(angle) * radius * (0.58 + drop * 0.08);
			parts.push(box([0.38, 1.05, 0.38], [x, 3.4 - drop * 0.55, z], willow, [0, angle, 0.08]));
		}
	}
	return assemble(parts);
}

/** Pine trees use a trunk and distinct tiered conical branch masses. */
export function pineTreeMesh(options = {}) {
	const seed = options.seed || 'pine-tree';
	const colors = modelPalette(seed);
	const pine = [0.12, 0.34, 0.18, 1];
	const parts = [cylinder(0.3, 4.7, [0, 2.35, 0], colors.wood, [0, 0, 0], 10)];
	for (let level = 0; level < 5; level += 1) {
		const radius = 1.7 - level * 0.26;
		for (let index = 0; index < 6; index += 1) {
			const angle = index / 6 * Math.PI * 2 + level * 0.34;
			parts.push(branch([0, 1.45 + level * 0.72, 0], radius, 0.06, colors.wood, angle, 0.48));
			parts.push(box([1.25, 0.42, 0.7], [Math.cos(angle) * radius * 0.72, 1.72 + level * 0.72, Math.sin(angle) * radius * 0.72], pine, [0, angle, 0.06]));
		}
	}
	return assemble(parts);
}

/** Flowering trees preserve visible branch structure and blossom constellations. */
export function floweringTreeMesh(options = {}) {
	const seed = options.seed || 'flowering-tree';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const blossom = [0.98, 0.58 + random() * 0.22, 0.72 + random() * 0.16, 1];
	const parts = [cylinder(0.3, 3, [0, 1.5, 0], colors.wood, [0, 0, 0], 11)];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const length = 1.1 + random() * 0.7;
		const center = [Math.cos(angle) * length * 0.82, 2.7 + random() * 1.2, Math.sin(angle) * length * 0.82];
		parts.push(branch([0, 1.9, 0], length, 0.08, colors.wood, angle, 0.72));
		parts.push(box([1.35, 0.85, 1.12], center, colors.green, [0.08, angle, 0.1]));
		parts.push(roundedCluster([center[0], center[1] + 0.18, center[2]], 5, 0.19, blossom, [1, 0.7, 1]));
	}
	return assemble(parts);
}

/** Olive trees combine a gnarled multi-stem base with airy silver leaf pads. */
export function oliveTreeMesh(options = {}) {
	const seed = options.seed || 'olive-tree';
	const colors = modelPalette(seed);
	const silver = [0.48, 0.58, 0.38, 1];
	const parts = [
		cylinder(0.28, 2.8, [-0.18, 1.35, 0], colors.wood, [0, 0, -0.12], 10),
		cylinder(0.22, 2.5, [0.2, 1.2, 0.08], colors.wood, [0, 0, 0.16], 9)
	];
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		parts.push(branch([0, 1.9, 0], 1.15, 0.065, colors.wood, angle, 0.66));
		parts.push(box([1.2, 0.5, 0.75], [Math.cos(angle) * 0.9, 2.6 + index % 3 * 0.28, Math.sin(angle) * 0.9], silver, [0.08, angle, 0.12]));
	}
	return assemble(parts);
}
