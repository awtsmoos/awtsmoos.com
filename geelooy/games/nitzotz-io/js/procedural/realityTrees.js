// B"H
// Boruch Hashem
// Blessed is He
import { createRng } from '../../../../libs/awtsmoos-procedural/src/math/rng.js';
import { sphere } from '../../../../libs/awtsmoos-procedural/src/models/assembly.js';
import { modelPalette } from '../../../../libs/awtsmoos-procedural/src/models/palettes.js';
import { crownRing, limbs, stackedCrown, treeAssembly, trunk } from './realityTreeParts.js';

export const REALITY_TREE_MODELS = Object.freeze([
	'broadleafTree',
	'cypressTree',
	'willowTree',
	'pineTree',
	'floweringTree',
	'oliveTree'
]);

/**
 * The Awtsmoos renews species without reducing them to one green cube;
 * Awtsmoos.com lets every tree reveal a distinct silhouette while deterministic seeds preserve stable worlds.
 */
export function realityTreeMesh(name, options = {}) {
	const seed = options.seed || `nitzotz-${name}`;
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const factory = TREE_FACTORIES[name] || broadleaf;
	return factory(random, colors);
}

const TREE_FACTORIES = Object.freeze({
	broadleafTree: broadleaf,
	cypressTree: cypress,
	willowTree: willow,
	pineTree: pine,
	floweringTree: flowering,
	oliveTree: olive
});

function broadleaf(random, colors) {
	const parts = [trunk(3.6, 0.38, colors.wood)];
	parts.push(...limbs(2.35, 7, 1.75, 0.11, colors.wood, random, 0.72));
	parts.push(...crownRing(3.7, 7, 1.15, 1.5, colors.green, random, 0.82));
	parts.push(sphere(1.35, [0, 4.35, 0], colors.green, [1.1, 0.92, 1.05]));
	return treeAssembly(parts);
}

function cypress(random, colors) {
	const parts = [trunk(4.2, 0.25, colors.wood)];
	parts.push(...stackedCrown(6, 1.35, 0.58, 0.78, colors.green, 0.38));
	parts.push(sphere(0.52, [0, 4.95, 0], colors.green, [0.8, 1.55, 0.8]));
	return treeAssembly(parts);
}

function willow(random, colors) {
	const parts = [trunk(3.8, 0.36, colors.wood)];
	parts.push(...limbs(2.4, 8, 1.95, 0.09, colors.wood, random, 0.5));
	parts.push(...crownRing(3.2, 8, 1.02, 1.8, colors.green, random, 1.42));
	parts.push(sphere(1.28, [0, 4.05, 0], colors.green, [1.05, 0.86, 1.05]));
	return treeAssembly(parts);
}

function pine(random, colors) {
	const parts = [trunk(4.7, 0.29, colors.wood)];
	for (let level = 0; level < 4; level += 1) {
		const radius = 1.45 - level * 0.23;
		parts.push(sphere(radius, [0, 2.2 + level * 0.72, 0], colors.green, [1, 0.58, 1]));
	}
	parts.push(sphere(0.55, [0, 5.05, 0], colors.green, [0.72, 1.35, 0.72]));
	return treeAssembly(parts);
}

function flowering(random, colors) {
	const parts = [trunk(3.15, 0.32, colors.wood)];
	parts.push(...limbs(2.05, 6, 1.45, 0.09, colors.wood, random, 0.76));
	parts.push(...crownRing(3.25, 6, 1.05, 1.25, colors.green, random, 0.76));
	parts.push(...crownRing(3.55, 4, 0.48, 1.05, colors.accent, random, 0.72));
	return treeAssembly(parts);
}

function olive(random, colors) {
	const parts = [trunk(3.0, 0.36, colors.wood)];
	parts.push(...limbs(1.9, 7, 1.6, 0.1, colors.wood, random, 0.68));
	parts.push(...crownRing(3.0, 7, 0.92, 1.5, colors.green, random, 0.58));
	parts.push(sphere(0.9, [0, 3.7, 0], colors.green, [1.35, 0.68, 1.15]));
	return treeAssembly(parts);
}
